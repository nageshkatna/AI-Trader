from pathlib import Path
from fetch_hst_files import fetch_hst_files
from hst_converter import convert
from paths import csv_dir, day_dir
import requests
import pandas as pd

def get_hst_files() -> list[Path]:
    return sorted(day_dir().glob("*.hst"))

def convert_csv_to_json(csv_file: Path) -> str:
    df = pd.read_csv(csv_file)
    json_data = df.to_json(orient="records")
    return json_data

def send_csv_files_to_api() -> None:
    for csv_file in sorted(csv_dir().glob("*.csv")):
        json_file = convert_csv_to_json(csv_file)
        try:
            requests.post(f"http://localhost:8000/api/v1/ingest/csv", files={"file": open(json_file, "rb")})
            print(f"Sent {csv_file} to API successfully")
        except Exception as e:
            print(f"Failed to send {csv_file} to API: {e}")
            continue


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
            print(f"Failed to convert {hst_file}")
            continue
        print(f"Converted {hst_file} successfully")
    
    send_csv_files_to_api()

if __name__ == "__main__":
    main()