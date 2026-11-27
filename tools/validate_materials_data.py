#!/usr/bin/env python3
"""Validate the structured polycarbonate materials dataset."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "materials" / "polycarbonate-sheets.json"

REQUIRED_FIELDS = {
    "material_type": str,
    "thickness_mm": int,
    "section_modulus_mm3_per_m": (int, float),
    "moment_of_inertia_mm4_per_m": (int, float),
    "weight_kg_per_m2": (int, float),
    "u_value_w_per_m2k": (int, float),
    "light_transmission_percent": (int, float),
    "allowable_flexural_stress_mpa": (int, float),
    "applications": list,
}

VALID_MATERIAL_TYPES = {"solid", "twin-wall", "triple-wall"}


def fail(errors, key, message):
    errors.append(f"{key}: {message}")


def validate_entry(entry, index):
    errors = []
    key = f"entries[{index}]"

    if not isinstance(entry, dict):
        return [f"{key}: entry must be an object"]

    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in entry:
            fail(errors, key, f"missing required field {field}")
        elif not isinstance(entry[field], expected_type):
            fail(errors, key, f"{field} has invalid type")

    if errors:
        return errors

    if entry["material_type"] not in VALID_MATERIAL_TYPES:
        fail(errors, key, f"unsupported material_type {entry['material_type']}")
    if entry["thickness_mm"] <= 0:
        fail(errors, key, "thickness_mm must be positive")
    if not 0 < entry["light_transmission_percent"] <= 100:
        fail(errors, key, "light_transmission_percent must be in (0, 100]")
    if entry["u_value_w_per_m2k"] <= 0:
        fail(errors, key, "u_value_w_per_m2k must be positive")
    if entry["weight_kg_per_m2"] <= 0:
        fail(errors, key, "weight_kg_per_m2 must be positive")
    for field in ("section_modulus_mm3_per_m", "moment_of_inertia_mm4_per_m", "allowable_flexural_stress_mpa"):
        if entry[field] <= 0:
            fail(errors, key, f"{field} must be positive")

    if entry["thickness_mm"] <= 0:
        return errors

    width_mm = 1000
    thickness = entry["thickness_mm"]
    solid_section_modulus = width_mm * thickness**2 / 6
    solid_moment_of_inertia = width_mm * thickness**3 / 12
    section_modulus = entry["section_modulus_mm3_per_m"]
    moment_of_inertia = entry["moment_of_inertia_mm4_per_m"]

    if section_modulus > solid_section_modulus * 1.01:
        fail(errors, key, "section_modulus_mm3_per_m exceeds the solid-section upper bound")
    if moment_of_inertia > solid_moment_of_inertia * 1.01:
        fail(errors, key, "moment_of_inertia_mm4_per_m exceeds the solid-section upper bound")
    if entry["material_type"] == "solid":
        if abs(section_modulus - solid_section_modulus) / solid_section_modulus > 0.01:
            fail(errors, key, "solid-section modulus does not match rectangular geometry")
        if abs(moment_of_inertia - solid_moment_of_inertia) / solid_moment_of_inertia > 0.01:
            fail(errors, key, "solid-section moment of inertia does not match rectangular geometry")
    if not entry["applications"]:
        fail(errors, key, "applications must not be empty")

    return errors


def main():
    try:
        data = json.loads(DATASET.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Dataset validation failed: {exc}", file=sys.stderr)
        return 1

    errors = []
    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        errors.append("entries: dataset must contain a non-empty list")
    else:
        seen = set()
        for index, entry in enumerate(entries):
            errors.extend(validate_entry(entry, index))
            if isinstance(entry, dict):
                identity = (entry.get("material_type"), entry.get("thickness_mm"))
                if identity in seen:
                    errors.append(f"entries[{index}]: duplicate material_type/thickness_mm")
                seen.add(identity)

    if errors:
        print("Dataset validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Dataset validation passed: {len(entries)} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
