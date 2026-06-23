"""
Generate the bundled Maine home-load lookup table for the ROI app.

Source: NREL ResStock End-Use Load Profiles, 2024 release 2, TMY3 weather,
public OEDI data lake (no credentials). Two inputs are combined:

1. Per-archetype ANNUAL electric kWh — from the state metadata+annual parquet
   (one row per modeled ME home, with characteristics + annual end uses).
   Grouped by (building_type x vintage x sqft_bin x heating_fuel), weighted by
   each model's `weight`. Sparse cells fall back through a collapse hierarchy
   that preserves heating fuel as long as possible (fuel is the dominant driver
   of evening electric load and is a user input we don't want to wash out).

2. A 5-9 PM weekday SHAPE FACTOR per building type — from the statewide
   timeseries aggregates (one CSV per building type, 15-min, period-ending).
   factor = mean(per-dwelling energy in the 17:00-21:00 weekday window)
            / mean(per-dwelling energy over all intervals).

Estimated 5-9 PM weekday avg power (kW) for an archetype:
    kw = (annual_kwh / 8760) * shape_factor[building_type]

Output: lib/maineLoadProfiles.json (a dense table; every UI combination
resolves to a real weighted average via the collapse hierarchy).

Run (needs pandas, pyarrow, boto3 — e.g. the home_energy_model venv):
    ~/apps/home_energy_model/.venv/bin/python scripts/generate_load_table.py
"""
import io
import json
import os

import boto3
import pandas as pd
from botocore import UNSIGNED
from botocore.config import Config

BUCKET = "oedi-data-lake"
BASE = (
    "nrel-pds-building-stock/end-use-load-profiles-for-us-building-stock/"
    "2024/resstock_tmy3_release_2/"
)
PARQUET = os.path.expanduser("~/apps/home_energy_model/data/ME_baseline.parquet")
OUT = os.path.join(os.path.dirname(__file__), "..", "lib", "maineLoadProfiles.json")

KWH = "out.electricity.total.energy_consumption.kwh"
TYPES = [
    "Single-Family Detached",
    "Single-Family Attached",
    "Mobile Home",
    "Multi-Family with 2 - 4 Units",
    "Multi-Family with 5+ Units",
]
VINTAGES = ["<1940", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s"]
SQFT_BINS = ["0-1499", "1500-2499", "2500-3999", "4000+"]
FUELS = ["Electricity", "Natural Gas", "Fuel Oil", "Propane", "Other Fuel"]
MIN_SAMPLES = 10
HOURS_PER_YEAR = 8760

# Aggregate CSV filename suffix per building type.
AGG_FILE = {
    "Single-Family Detached": "single-family_detached",
    "Single-Family Attached": "single-family_attached",
    "Mobile Home": "mobile_home",
    "Multi-Family with 2 - 4 Units": "multi-family_with_2_-_4_units",
    "Multi-Family with 5+ Units": "multi-family_with_5plus_units",
}

s3 = boto3.client("s3", config=Config(signature_version=UNSIGNED))


def shape_factor(building_type: str) -> float:
    key = (
        BASE + "timeseries_aggregates/by_state/upgrade=0/state=ME/"
        f"up00-me-{AGG_FILE[building_type]}.csv"
    )
    print(f"  fetching shape: {AGG_FILE[building_type]}")
    raw = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    df = pd.read_csv(io.BytesIO(raw), usecols=["timestamp", "units_represented", KWH])
    ts = pd.to_datetime(df["timestamp"])
    # period-ending 15-min -> interval start is 15 min earlier
    start = ts - pd.Timedelta(minutes=15)
    per_dwelling = df[KWH] / df["units_represented"]
    in_window = (start.dt.weekday < 5) & (start.dt.hour.isin([17, 18, 19, 20]))
    return float(per_dwelling[in_window].mean() / per_dwelling.mean())


def weighted_mean(df: pd.DataFrame) -> float:
    w = df["weight"]
    return float((df[KWH] * w).sum() / w.sum())


def resolve(df: pd.DataFrame, t: str, v: str, s: str, f: str):
    """Most-specific match with >= MIN_SAMPLES rows; fuel preserved as long as possible."""
    base = df[df["bt"] == t]
    candidates = [
        ("type+vintage+sqft+fuel", base[(base.vin == v) & (base.sb == s) & (base.fuel == f)]),
        ("type+vintage+fuel", base[(base.vin == v) & (base.fuel == f)]),
        ("type+fuel", base[base.fuel == f]),
        ("type+vintage+sqft", base[(base.vin == v) & (base.sb == s)]),
        ("type+vintage", base[base.vin == v]),
        ("type", base),
        ("all", df),
    ]
    for level, sub in candidates:
        if len(sub) >= MIN_SAMPLES:
            return weighted_mean(sub), len(sub), level
    return weighted_mean(df), len(df), "all"


def sqft_bin(x: float) -> str:
    if x < 1500:
        return "0-1499"
    if x < 2500:
        return "1500-2499"
    if x < 4000:
        return "2500-3999"
    return "4000+"


def main():
    df = pd.read_parquet(PARQUET)
    df = df.rename(
        columns={
            "in.geometry_building_type_recs": "bt",
            "in.vintage": "vin",
            "in.heating_fuel": "fuel",
        }
    )
    df["sb"] = df["in.sqft"].apply(sqft_bin)
    df = df[df["bt"].isin(TYPES) & df["fuel"].isin(FUELS)]

    print("computing shape factors...")
    factors = {t: shape_factor(t) for t in TYPES}
    for t, fac in factors.items():
        print(f"    {t}: {fac:.3f}")

    print("building table...")
    table = {}
    for t in TYPES:
        for v in VINTAGES:
            for s in SQFT_BINS:
                for f in FUELS:
                    annual, n, level = resolve(df, t, v, s, f)
                    kw = (annual / HOURS_PER_YEAR) * factors[t]
                    table[f"{t}|{v}|{s}|{f}"] = {
                        "kw": round(kw, 3),
                        "n": n,
                        "level": level,
                    }

    out = {
        "meta": {
            "source": "NREL ResStock 2024 release 2, TMY3 weather (OEDI data lake)",
            "region": "Maine",
            "window": "17:00-21:00 weekday (5-9 PM)",
            "metric": "avg electric power (kW) during the window",
            "method": "per-archetype annual kWh x per-building-type 5-9PM shape factor",
            "minSamples": MIN_SAMPLES,
        },
        "types": TYPES,
        "vintages": VINTAGES,
        "sqftBins": SQFT_BINS,
        "fuels": FUELS,
        "shapeFactorByType": {t: round(f, 4) for t, f in factors.items()},
        "table": table,
    }
    with open(OUT, "w") as fh:
        json.dump(out, fh, indent=0)
    print(f"wrote {os.path.relpath(OUT)} ({len(table)} archetypes)")


if __name__ == "__main__":
    main()
