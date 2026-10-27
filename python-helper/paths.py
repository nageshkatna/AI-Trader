from datetime import date
from pathlib import Path

HST_FILES_DIR = Path(__file__).resolve().parent / "hst-files"


def day_dir(day: date | None = None) -> Path:
    return HST_FILES_DIR / (day or date.today()).strftime("%d-%m-%Y")


def csv_dir(day: date | None = None) -> Path:
    return day_dir(day) / "CSVs"
