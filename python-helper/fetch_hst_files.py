"""
Copy NDAQ* history files from the MetaTrader terminal folder into
python-helper/hst-files/<dd-mm-yyyy>/.

Usage:
    python fetch-hst-files.py
"""

import shutil
from pathlib import Path

from paths import day_dir

WINDOWS_SOURCE = Path(
    r"C:\Users\nageshkatna\AppData\Roaming\MetaQuotes\Terminal"
    r"\B313D8B5E3EEA7D6CF15F515B9125C20\history\CMCMarkets1-Canada"
)

WSL_SOURCE = Path(
    "/mnt/c/Users/nageshkatna/AppData/Roaming/MetaQuotes/Terminal"
    "/B313D8B5E3EEA7D6CF15F515B9125C20/history/CMCMarkets1-Canada"
)

FILE_PREFIX = "NDAQ"


def resolve_source() -> Path:
    for path in (WINDOWS_SOURCE, WSL_SOURCE):
        if path.is_dir():
            return path
    raise FileNotFoundError(
        "Could not find the MetaTrader history folder. Tried:\n"
        f"  {WINDOWS_SOURCE}\n"
        f"  {WSL_SOURCE}"
    )


def fetch_hst_files() -> bool:
    source = resolve_source()
    dest = day_dir()
    dest.mkdir(parents=True, exist_ok=True)

    matches = sorted(
        p for p in source.iterdir() if p.is_file() and p.name.startswith(FILE_PREFIX)
    )
    if not matches:
        print(f"No files starting with {FILE_PREFIX} found in {source}")
        return False

    copied = 0
    try:
        for src_file in matches:
            dest_file = dest / src_file.name
            if dest_file.exists():
                print(f"Skipped {src_file.name}: already exists")
                continue
            shutil.copy2(src_file, dest_file)
            print(f"Copied {src_file.name}")
            copied += 1
        print(f"Copied {copied} of {len(matches)} file(s) to {dest}")
        return True
    except Exception as e:
        print(f"Error copying files: {e}")
        return False
