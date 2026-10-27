import os
from pathlib import Path

import pandas as pd
import requests

from fetch_hst_files import fetch_hst_files
from hst_converter import HEADER_SIZE, convert, read_header
from paths import csv_dir, day_dir

INGEST_URL = os.environ.get("INGEST_API_URL", "http://localhost:3000/ingest")
INGEST_API_KEY = os.environ.get("INGEST_API_KEY", "change-me")
SOURCE = "mt4.hst"
BATCH_SIZE = 1000

TIMEFRAMES = {
    1: "M1",
    5: "M5",
    15: "M15",
    30: "M30",
    60: "H1",
    240: "H4",
    1440: "D1",
    10080: "W1",
    43200: "MN1",
}


def get_hst_files() -> list[Path]:
    return sorted(day_dir().glob("*.hst"))


def bars_from_csv(csv_file: Path) -> list[dict]:
    with open(day_dir() / f"{csv_file.stem}.hst", "rb") as f:
        header = read_header(f.read(HEADER_SIZE))
    timeframe = TIMEFRAMES.get(header["period_minutes"], f"M{header['period_minutes']}")
    df = pd.read_csv(csv_file)
    return [
        {
            "symbol": header["symbol"],
            "timeframe": timeframe,
            "ts": f"{row.Date.replace('.', '-')}T{row.Time}:00Z",
            "open": float(row.Open),
            "high": float(row.High),
            "low": float(row.Low),
            "close": float(row.Close),
            "volume": float(row.Volume),
            "source": SOURCE,
        }
        for row in df.itertuples(index=False)
    ]


def send_csv_files_to_api() -> None:
    for csv_file in sorted(csv_dir().glob("*.csv")):
        try:
            bars = bars_from_csv(csv_file)
            last_status = None
            for start in range(0, len(bars), BATCH_SIZE):
                response = requests.post(
                    INGEST_URL,
                    headers={"x-ingest-key": INGEST_API_KEY},
                    json={"kind": "bars", "source": SOURCE, "bars": bars[start:start + BATCH_SIZE]},
                    timeout=60,
                )
                last_status = response.status_code
                if not response.ok:
                    print(f"Failed to send {csv_file.name}: HTTP {response.status_code}")
                    break
            else:
                print(f"Sent {csv_file.name}: {len(bars)} bars HTTP {last_status}")
        except requests.HTTPError as e:
            status = e.response.status_code if e.response is not None else "none"
            print(f"Failed to send {csv_file.name}: HTTP {status}")
        except Exception as e:
            print(f"Failed to send {csv_file.name}: {type(e).__name__} HTTP none")


def main() -> None:
    if not fetch_hst_files():
        print("Failed to fetch HST files")
        return
    hst_files = get_hst_files()
    if not hst_files:
        print("No HST files found")
        return

    out_dir = csv_dir()
    out_dir.mkdir(parents=True, exist_ok=True)

    for hst_file in hst_files:
        converted = convert(hst_file, out_dir / f"{hst_file.stem}.csv")
        if not converted:
            print(f"Failed to convert {hst_file.name}")
            continue
        print(f"Converted {hst_file.name}")

    send_csv_files_to_api()

if __name__ == "__main__":
    main()
