#!/usr/bin/env python3
"""Build a district-keyed 2026 House nominee snapshot from the national race table.

Usage:
  python3 scripts/build-house-nominees.py \
    --html /path/to/2026-house-election-page.html \
    --model model1-special-elections.json \
    --output house-nominees-2026.json

The source table lists the current general-election field when a primary is
complete and the active primary field when it is not. A party name is promoted
to the nominee field only when exactly one candidate from that party is listed.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path

from lxml import html


STATE_ABBR = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT",
    "Delaware": "DE", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI",
    "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME",
    "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
    "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
    "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
    "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
    "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
    "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}


def text_content(node) -> str:
    return " ".join(" ".join(node.xpath(".//text()")).split())


def district_label(raw: str) -> str | None:
    match = re.match(r"^(.*?)(?:\s+)(at-large|\d+)$", raw)
    if not match or match.group(1) not in STATE_ABBR:
        return None
    state, district = match.groups()
    if district == "at-large":
        return f"{STATE_ABBR[state]} at-large"
    return f"{STATE_ABBR[state]}-{int(district):02d}"


def candidates_from_cell(cell) -> list[dict[str, str]]:
    candidates: list[dict[str, str]] = []
    for item in cell.xpath(".//li"):
        candidate_text = text_content(item)
        match = re.match(
            r"^▌?\s*(.*?)\s*\((Democratic|Republican)\)(?:\s*\[.*)?$",
            candidate_text,
        )
        if match:
            candidates.append({"name": match.group(1).strip(), "party": match.group(2)[0]})

    if candidates:
        return candidates

    for name, party in re.findall(
        r"▌\s*([^▌]+?)\s*\((Democratic|Republican)\)", text_content(cell)
    ):
        candidates.append({"name": name.strip(), "party": party[0]})
    return candidates


def parse_source(path: Path) -> dict[str, dict]:
    root = html.parse(str(path)).getroot()
    records: dict[str, dict] = {}

    for table in root.xpath('//table[contains(@class,"wikitable")]'):
        for row in table.xpath(".//tr"):
            cells = row.xpath("./th|./td")
            if len(cells) < 3:
                continue
            label = district_label(text_content(cells[0]))
            if not label:
                continue
            candidate_text = text_content(cells[-1])
            if "(Democratic)" not in candidate_text and "(Republican)" not in candidate_text:
                continue
            candidates = candidates_from_cell(cells[-1])
            if not candidates:
                continue
            record = {
                "raceStatus": text_content(cells[-2]),
                "candidates": candidates,
            }
            if label not in records or len(candidates) > len(records[label]["candidates"]):
                records[label] = record
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--html", required=True, type=Path)
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--retrieved", default=date.today().isoformat())
    args = parser.parse_args()

    source_records = parse_source(args.html)
    model = json.loads(args.model.read_text())
    output_records = []

    for district in model["districts"]:
        record = source_records.get(district["label"], {"raceStatus": "Not listed", "candidates": []})
        democrats = [candidate["name"] for candidate in record["candidates"] if candidate["party"] == "D"]
        republicans = [candidate["name"] for candidate in record["candidates"] if candidate["party"] == "R"]
        output_records.append({
            "id": district["id"],
            "label": district["label"],
            "democratic": democrats[0] if len(democrats) == 1 else None,
            "republican": republicans[0] if len(republicans) == 1 else None,
            "democraticFieldSize": len(democrats),
            "republicanFieldSize": len(republicans),
            "raceStatus": record["raceStatus"],
        })

    payload = {
        "schemaVersion": 1,
        "retrieved": args.retrieved,
        "source": "2026 United States House of Representatives elections",
        "sourceUrl": "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections",
        "method": "A party nominee or presumptive nominee is shown only when exactly one candidate from that party is listed in the current district table.",
        "districtCount": len(output_records),
        "bothMajorPartyNames": sum(1 for item in output_records if item["democratic"] and item["republican"]),
        "districts": output_records,
    }
    args.output.write_text(json.dumps(payload, indent=2) + "\n")


if __name__ == "__main__":
    main()
