# Materials Data Platform Roadmap

SinoPlastix is developing a software and structured-data layer for polymer sheet engineering. The goal is to convert manual specification work — material selection, load calculations, technical documentation, and quotation support — into maintainable digital workflows.

This repository currently contains the first building blocks rather than a finished product:

- `calculators/polycarbonate_load_calculator.py` — initial load-capacity calculation code
- `data/materials/polycarbonate-sheets.json` — initial structured materials dataset
- `tools/validate_materials_data.py` — dataset validation utility
- `tools/rfq-specification-assistant/` — first internal prototype for structured RFQ intake, application routing, engineering screening checks and quotation-support summaries
- `data/applications/application-selection-rules.json` — initial structured application-rule dataset used by the RFQ assistant
- Engineering documentation covering selection, structural design, fabrication, roofing, and greenhouse applications

The materials dataset is currently limited to geometrically determinate solid polycarbonate sheet properties. Values must be validated against current manufacturer datasheets before customer-facing or production use.

## Phase 1 product frame

The first product frame is a B2B CPQ and engineering-specification workflow for polymer sheet and fabrication customers. It combines scenario-based material selection, 2D/template quotation inputs, plastic-specific DFM checks, nesting and cost formulas, PDF quotation output, and structured inquiry persistence.

- [Digital business platform blueprint](polymer-sheet-digital-business-platform-blueprint.md)
- [Information architecture, user flows and PRD](b2b-cpq-mvp/information-architecture-and-prd.md)
- [Rules, data model, pricing formulas and DFM design](b2b-cpq-mvp/rules-data-and-pricing-design.md)
- [Clickable CPQ structure prototype](../../tools/cpq-prototype/index.html)
- [CPQ prototype documentation and limitations](../../tools/cpq-prototype/README.md)

The initial structural framework now exists as a clickable prototype and data/rules framework. It validates the product shape, but it is not yet a production CPQ system: manufacturer-validated data, server persistence, real DXF parsing, irregular nesting, PDF generation, authentication, audit trails and end-to-end browser tests remain open.

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

### Days 36–60: Selection MVP pilot

- Pilot the first internal RFQ specification assistant against real inquiries
- Move application-specific logic into validated structured rules and record evidence status
- Expand inputs beyond the prototype: load, climate, fabrication constraints, documentation requirements and customer segment
- Improve outputs: candidate material, thickness, limitations, required confirmations, missing information and quotation-support technical summary

### Days 61–90: Pilot and iteration

- Test the MVP against real quotation and technical-support cases
- Measure repeated manual engineering work avoided
- Add AI-assisted retrieval only after the underlying dataset and source citations are reliable
- Define the next product phase using the [Polymer Application Engineering OS Strategy](polymer-application-engineering-os-strategy.md): customer self-service selection, distributor tools, traceable evidence, and automated technical documentation

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
