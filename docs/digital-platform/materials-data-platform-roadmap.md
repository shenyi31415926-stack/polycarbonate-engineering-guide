# Materials Data Platform Roadmap

SinoPlastix is developing a software and structured-data layer for polymer sheet engineering. The goal is to convert manual specification work — material selection, load calculations, technical documentation, and quotation support — into maintainable digital workflows.

This repository currently contains the first building blocks rather than a finished product:

- `calculators/polycarbonate_load_calculator.py` — initial load-capacity calculation code
- `data/materials/polycarbonate-sheets.json` — initial structured materials dataset
- `tools/validate_materials_data.py` — dataset validation utility
- Engineering documentation covering selection, structural design, fabrication, roofing, and greenhouse applications

The dataset is marked as legacy engineering estimates. Values must be validated against current manufacturer datasheets before customer-facing or production use.

## 90-Day Engineering Plan

### Days 1–15: Data and calculation core

- Define a stable schema for material type, thickness, optical properties, thermal properties, mechanical properties, applications, and constraints
- Refactor the load calculator into tested, reusable modules
- Add unit tests, input validation, and data-quality checks
- Record data provenance: standard, manufacturer datasheet, laboratory test, or engineering estimate

### Days 16–35: Internal engineering tools

- Expose calculation workflows through a CLI or small API
- Add continuous integration for tests, schema validation, and documentation checks
- Connect documentation references to the same structured data used by the calculation code

### Days 36–60: Selection MVP

- Build a lightweight material-selection workflow for internal engineering and sales teams
- Inputs: application, dimensions, load, climate, fabrication constraints, and documentation requirements
- Outputs: candidate material, thickness, limitations, required confirmations, and a quotation-support technical summary

### Days 61–90: Pilot and iteration

- Test the MVP against real quotation and technical-support cases
- Measure repeated manual engineering work avoided
- Add AI-assisted retrieval only after the underlying dataset and source citations are reliable
- Define the next product phase: customer self-service selection, distributor tools, and automated technical documentation

## Product Principles

1. **Engineering before marketing** — every calculation and recommendation must identify assumptions and limits.
2. **Data provenance** — distinguish verified datasheet values from estimates and legacy reference values.
3. **Small usable tools first** — internal workflows come before broad customer-facing claims.
4. **Software-maintainable documentation** — technical documents should be generated or checked from the same source data wherever practical.

## Initial Success Targets

- Working internal MVP within 90 days
- Automated validation for the structured materials dataset
- Automated tests around the calculation core
- Measurable reduction in repetitive quotation and technical-support work

These are targets, not claims of existing outcomes.
