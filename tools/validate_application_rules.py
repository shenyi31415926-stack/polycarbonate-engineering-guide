#!/usr/bin/env python3
"""Validate canonical application-selection rules and their generated browser wrapper."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "applications" / "application-selection-rules.json"
GENERATED = ROOT / "tools" / "rfq-specification-assistant" / "application_rules.js"
REQUIRED_RULE_FIELDS = {"label", "candidate", "starting_point", "confirmations", "warnings", "product_link", "required_inputs"}
VALID_REQUIRED_INPUTS = {"thickness", "dimensions", "quantity", "destination", "design_load", "temperature_swing"}


def fail(errors, message):
    errors.append(message)


def main():
    errors = []
    try:
        canonical = json.loads(SOURCE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Application-rules validation failed: {exc}", file=sys.stderr)
        return 1

    rules = canonical.get("rules")
    if not isinstance(rules, dict) or not rules:
        fail(errors, "rules must be a non-empty object")
    else:
        for key, rule in rules.items():
            missing = REQUIRED_RULE_FIELDS - set(rule)
            if missing:
                fail(errors, f"{key}: missing fields {sorted(missing)}")
                continue
            if not rule["product_link"].startswith("https://sinoplastix.com/"):
                fail(errors, f"{key}: product_link must be a sinoplastix.com HTTPS URL")
            for list_field in ("confirmations", "warnings"):
                value = rule[list_field]
                if not isinstance(value, list) or not value or not all(isinstance(item, str) and item.strip() for item in value):
                    fail(errors, f"{key}: {list_field} must be a non-empty list of non-empty strings")
            invalid_inputs = set(rule["required_inputs"]) - VALID_REQUIRED_INPUTS
            if invalid_inputs:
                fail(errors, f"{key}: unsupported required_inputs {sorted(invalid_inputs)}")
            overrides = rule.get("requirement_overrides", {})
            if not isinstance(overrides, dict):
                fail(errors, f"{key}: requirement_overrides must be an object")
            elif any(not isinstance(value, dict) for value in overrides.values()):
                fail(errors, f"{key}: every requirement override must be an object")

    try:
        generated = GENERATED.read_text(encoding="utf-8")
        start = generated.index("  const data = ") + len("  const data = ")
        end = generated.index(";\n  if (typeof module", start)
        generated_data = json.loads(generated[start:end])
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        fail(errors, f"generated wrapper cannot be parsed: {exc}")
    else:
        if generated_data != canonical:
            fail(errors, "generated application_rules.js is not in sync with canonical JSON; run tools/generate_application_rules_js.py")

    if errors:
        print("Application-rules validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Application-rules validation passed: {len(rules)} application rules")
    return 0


if __name__ == "__main__":
    sys.exit(main())
