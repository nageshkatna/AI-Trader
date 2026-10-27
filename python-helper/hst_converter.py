"""
mt4_hst_to_csv.py

Converts an MT4 ".hst" history file (e.g. NDAQ100M5.hst) into a
readable CSV with Date, Time, Open, High, Low, Close, Volume columns.

MT4 .hst files come in two versions:
  - Version 400 (older): 148-byte header, then 44-byte bar records
  - Version 401 (newer):  148-byte header, then 60-byte bar records
This script auto-detects which version the file uses and parses it
accordingly.

Usage:
    python mt4_hst_to_csv.py NDAQ100M5.hst NDAQ100M5.csv
"""

import struct
import sys
import csv
from datetime import datetime, timezone

HEADER_SIZE = 148
RECORD_SIZE_V400 = 44
RECORD_SIZE_V401 = 60


def read_header(data: bytes):
    """Read the 148-byte MT4 history file header."""
    version = struct.unpack("<i", data[0:4])[0]
    symbol = data[68:80].split(b"\x00")[0].decode(errors="ignore")
    period = struct.unpack("<i", data[80:84])[0]
    digits = struct.unpack("<i", data[84:88])[0]
    return {
        "version": version,
        "symbol": symbol,
        "period_minutes": period,
        "digits": digits,
    }


def parse_records(data: bytes, version: int):
    """Yield (time, open, high, low, close, volume) tuples from the bar records."""
    body = data[HEADER_SIZE:]

    if version == 400:
        record_size = RECORD_SIZE_V400
        fmt = "<i d d d d d"  # time, open, low, high, close, volume
        # NOTE: v400 field order on disk is time, open, low, high, close, volume
        field_order = ("time", "open", "low", "high", "close", "volume")
    elif version == 401:
        record_size = RECORD_SIZE_V401
        fmt = "<q d d d d Q i Q"  # time, open, high, low, close, tick_vol, spread, real_vol
        field_order = ("time", "open", "high", "low", "close",
                        "tick_volume", "spread", "real_volume")
    else:
        raise ValueError(
            f"Unrecognized .hst version: {version}. "
            "Expected 400 or 401 — the file may be corrupted or from an unsupported "
            "MT4/MT5 build."
        )

    count = len(body) // record_size
    for i in range(count):
        chunk = body[i * record_size: (i + 1) * record_size]
        if len(chunk) < record_size:
            break  # trailing partial record, ignore
        values = struct.unpack(fmt, chunk)
        row = dict(zip(field_order, values))
        yield row


def convert(input_path: str, output_path: str) -> bool:
    with open(input_path, "rb") as f:
        data = f.read()

    if len(data) < HEADER_SIZE:
        raise ValueError("File is too small to be a valid .hst file.")

    header = read_header(data)
    print(f"Detected: version={header['version']}, symbol='{header['symbol']}', "
          f"period={header['period_minutes']} min, digits={header['digits']}")

    rows_written = 0
    try:
        with open(output_path, "w", newline="") as out:
            writer = csv.writer(out)
            writer.writerow(["Date", "Time", "Open", "High", "Low", "Close", "Volume"])

            for row in parse_records(data, header["version"]):
                dt = datetime.fromtimestamp(row["time"], tz=timezone.utc)
                volume = row.get("real_volume") or row.get("volume") or row.get("tick_volume") or 0
                writer.writerow([
                    dt.strftime("%Y.%m.%d"),
                    dt.strftime("%H:%M"),
                    row["open"],
                    row["high"],
                    row["low"],
                    row["close"],
                    volume,
                ])
                rows_written += 1
            return True
    except Exception as e:
        print(f"Failed to convert {input_path}: {e}")
        return False
        