#!/usr/bin/env python3
"""Validate the SinoPlastix public product-catalog reference dataset."""

import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "materials" / "sinoplastix-product-catalog.json"
SCHEMA = ROOT / "data" / "materials" / "sinoplastix-product-catalog.schema.json"
REQUIRED_ENTRY_IDS = {"pc-solid", "pc-multiwall", "pmma-sheet", "petg-sheet"}


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def walk(value, path=""):
    if isinstance(value, dict):
        yield path, value
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            yield from walk(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk(child, f"{path}[{index}]")


def validate_source_keys(entry, errors):
    sources = entry.get("sources", {})
    for path, node in walk(entry):
        source_key = node.get("source_key") if isinstance(node, dict) else None
        if source_key is not None and source_key not in sources:
            errors.append(f"{entry['id']}:{path}: source_key '{source_key}' is not declared in sources")


def validate_ranges(value, entry_id, errors, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            if isinstance(child, dict) and ("min" in child or "max" in child):
                minimum = child.get("min")
                maximum = child.get("max")
                if minimum is not None and not is_number(minimum):
                    errors.append(f"{entry_id}:{child_path}: min must be numeric")
                if maximum is not None and not is_number(maximum):
                    errors.append(f"{entry_id}:{child_path}: max must be numeric")
                if "min" in child and minimum is None:
                    errors.append(f"{entry_id}:{child_path}: explicit null min is not allowed; omit the bound instead")
                if "max" in child and maximum is None:
                    errors.append(f"{entry_id}:{child_path}: explicit null max is not allowed; omit the bound instead")
                if is_number(minimum) and is_number(maximum) and minimum > maximum:
                    errors.append(f"{entry_id}:{child_path}: min exceeds max")
                if is_number(minimum) and minimum <= 0:
                    errors.append(f"{entry_id}:{child_path}: min must be positive")
                if is_number(maximum) and maximum <= 0:
                    errors.append(f"{entry_id}:{child_path}: max must be positive")
            validate_ranges(child, entry_id, errors, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            validate_ranges(child, entry_id, errors, f"{path}[{index}]")


def validate_widths(value, entry_id, errors, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            if key == "standard_widths_mm":
                if not isinstance(child, list) or not child or not all(is_number(width) and width > 0 for width in child):
                    errors.append(f"{entry_id}:{child_path}: standard_widths_mm must be a non-empty list of positive numbers")
            validate_widths(child, entry_id, errors, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            validate_widths(child, entry_id, errors, f"{path}[{index}]")


def validate_entry(entry, index):
    errors = []
    key = f"entries[{index}]"
    if not isinstance(entry, dict):
        return [f"{key}: entry must be an object"]

    for field in ["id", "polymer", "material_family", "product_form", "commercial_status", "evidence_level", "sources"]:
        if field not in entry:
            errors.append(f"{key}: missing required field {field}")
    if errors:
        return errors

    entry_id = entry["id"]
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", entry_id):
        errors.append(f"{key}: id must use lowercase kebab-case")
    if entry["commercial_status"] == "publicly-offered":
        if not entry["sources"]:
            errors.append(f"{entry_id}: publicly offered entries need at least one source")
        default_source_key = entry.get("default_source_key")
        if not default_source_key:
            errors.append(f"{entry_id}: publicly offered entries need default_source_key for inherited fact provenance")
        elif default_source_key not in entry["sources"]:
            errors.append(f"{entry_id}: default_source_key '{default_source_key}' is not declared in sources")

    for source_key, url in entry["sources"].items():
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.netloc != "sinoplastix.com":
            errors.append(f"{entry_id}: source '{source_key}' must be a public sinoplastix.com HTTPS URL")

    validate_source_keys(entry, errors)
    validate_ranges(entry, entry_id, errors)
    validate_widths(entry, entry_id, errors)

    if entry_id == "petg-sheet":
        if entry.get("commercial_status") != "not-evidenced-on-public-website":
            errors.append("petg-sheet: PETG must remain marked as not evidenced until a source is added")
        if "dimensions" in entry or "properties" in entry:
            errors.append("petg-sheet: placeholder gap record must not assert dimensions or properties")

    if entry_id == "pmma-sheet":
        route_ids = {route.get("id") for route in entry.get("routes", []) if isinstance(route, dict)}
        if route_ids != {"cast", "extruded"}:
            errors.append("pmma-sheet: routes must include exactly cast and extruded")
        variant_ids = {variant.get("id") for variant in entry.get("variants", []) if isinstance(variant, dict)}
        if not {"clear", "frosted", "coloured"}.issubset(variant_ids):
            errors.append("pmma-sheet: variants must include clear, frosted and coloured")

    if entry_id == "pc-multiwall":
        structures = entry.get("structures", [])
        structure_ids = {structure.get("id") for structure in structures if isinstance(structure, dict)}
        required_structures = {"twin-wall", "triple-or-four-wall", "x-structure-or-honeycomb"}
        if structure_ids != required_structures or len(structure_ids) != len(structures):
            errors.append("pc-multiwall: structures must uniquely cover twin-wall, triple-or-four-wall and x-structure-or-honeycomb")
        for structure in structures:
            thickness = structure.get("thickness_mm", {}) if isinstance(structure, dict) else {}
            if not thickness or not (is_number(thickness.get("min")) and thickness.get("min") > 0):
                errors.append(f"pc-multiwall:{structure.get('id', '<unknown>')}: documented positive thickness range is required")

    return errors


def main():
    try:
        data = json.loads(DATASET.read_text())
        schema = json.loads(SCHEMA.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Catalog validation failed: {exc}", file=sys.stderr)
        return 1

    errors = []
    if schema.get("type") != "object":
        errors.append("schema: root schema must be an object schema")
    else:
        try:
            import jsonschema  # type: ignore[import-not-found]
        except ImportError:
            jsonschema = None
        if jsonschema is None:
            errors.append("schema validation requires the jsonschema Python package")
        else:
            for error in jsonschema.validators.validator_for(schema)(schema).iter_errors(data):
                errors.append(f"schema violation at {'/'.join(str(part) for part in error.absolute_path) or '<root>'}: {error.message}")
    if data.get("dataset") != "sinoplastix-public-product-catalog":
        errors.append("dataset: unexpected dataset name")
    if data.get("verification_status") != "public-website-reference-data-not-a-production-datasheet":
        errors.append("verification_status: catalog must remain marked as public reference data, not a production datasheet")
    try:
        date.fromisoformat(data.get("accessed_at", ""))
    except ValueError:
        errors.append("accessed_at: must be an ISO date")

    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        errors.append("entries: dataset must contain a non-empty list")
    else:
        ids = []
        for index, entry in enumerate(entries):
            errors.extend(validate_entry(entry, index))
            if isinstance(entry, dict):
                ids.append(entry.get("id"))
        duplicates = sorted({entry_id for entry_id in ids if ids.count(entry_id) > 1})
        if duplicates:
            errors.append(f"entries: duplicate ids {', '.join(duplicates)}")
        missing = REQUIRED_ENTRY_IDS - set(ids)
        if missing:
            errors.append(f"entries: missing required Phase 1 ids {', '.join(sorted(missing))}")

    if errors:
        print("Catalog validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Catalog validation passed: {len(entries)} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
