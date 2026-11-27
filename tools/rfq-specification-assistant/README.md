# RFQ Specification Assistant

A dependency-free browser prototype for converting incomplete polycarbonate or acrylic sheet inquiries into a structured technical summary before quotation.

## Business workflow

The tool is designed for internal sales, technical-support and specification teams. It helps with the repeated work that happens before a quotation can be written:

1. Identify the application and likely material route.
2. Capture dimensions, thickness, quantity, destination and functional requirements.
3. Detect missing information that blocks a reliable quotation.
4. Calculate screening values for sheet area, indicative weight, thermal movement, fastener clearance and solid-sheet span.
5. Generate a copy-ready technical summary for internal review or customer follow-up.

## Architecture

This is intentionally a small first slice of the broader [Polymer Application Engineering OS](../../docs/digital-platform/polymer-application-engineering-os-strategy.md):

- `../../data/applications/application-selection-rules.json` is the canonical structured application-rule dataset.
- `../generate_application_rules_js.py` generates `application_rules.js` for dependency-free browser use.
- `specification_logic.js` contains deterministic calculations and workflow logic, not application-specific marketing copy.
- `../validate_application_rules.py` checks the rule schema and verifies that the generated browser wrapper is synchronized.

The purpose is to test the long-term architecture — structured rules plus deterministic engineering checks — before adding persistence, AI-assisted drafting or customer-facing configuration.

## Run locally

Open `index.html` directly in a browser, or serve the repository and open:

```text
tools/rfq-specification-assistant/index.html
```

## Validate the logic

Open `test-runner.html` in a browser and confirm that it reports `RFQ specification assistant tests passed`. If Node.js is available, the same test file can also be run directly:

```bash
node tools/rfq-specification-assistant/test_specification_logic.js
```

## Engineering limitations

- Outputs are screening aids, not certified structural design.
- Multiwall section properties depend on manufacturer-specific geometry and must be confirmed against project-specific datasheets before structural use.
- Weight estimates are indicative and must be confirmed in the written quotation.
- Fastener clearance and thermal movement are starting checks only; final installation details depend on the framing system, fixing position and project requirements.
- Functional grades such as flame-retardant, ESD, anti-fog and hard-coated sheet require written grade confirmation and relevant test evidence.

## Source rules used in the prototype

- Polycarbonate thermal expansion coefficient: 0.065 mm/m·K
- Acrylic thermal expansion coefficient: 0.07 mm/m·K
- Solid polycarbonate density approximation: 1.2 kg/m² per mm thickness
- Acrylic density approximation: 1.19 kg/m² per mm thickness
- Solid rectangular-section geometric properties calculated per metre width
- Conservative, non-certified simply supported span screening using flexural modulus 2,300 MPa, allowable stress 12 MPa and safety factor 1.5
