# SinoPlastix Public Product-Catalog Data Model

This directory-free data layer starts the transition from unstructured product webpages to machine-readable material master data for quotation, selection rules, RFQ generation and future customer-facing configuration.

The current implementation is intentionally conservative: it records only facts explicitly published on `sinoplastix.com`, keeps provenance attached to fact groups, and leaves unknown engineering fields absent rather than filling them with attractive but unverified numbers.

## Files

- [`data/materials/sinoplastix-product-catalog.json`](../../../data/materials/sinoplastix-product-catalog.json) — structured public catalog facts.
- [`data/materials/sinoplastix-product-catalog.schema.json`](../../../data/materials/sinoplastix-product-catalog.schema.json) — machine-readable root schema.
- [`tools/validate_sinoplastix_catalog.py`](../../../tools/validate_sinoplastix_catalog.py) — repository validator for structural, provenance and Phase 1 coverage rules.

## Design principles

1. **Provenance before convenience.** Every public fact group carries a `source_key` that resolves to a source URL in the same entry.
2. **No invented completeness.** If the website does not state thickness, width, mechanical performance, price, stock status or compliance evidence, the field is omitted.
3. **Reference data is not production approval.** `verification_status` explicitly marks the dataset as public-web reference data, not a manufacturer datasheet or project approval basis.
4. **Separate product family, process route and variant.** PMMA is not flattened into false precision: cast/extruded route differences are stored separately from clear/frosted/coloured variant dimensions.
5. **Gaps are data too.** PETG is present as a gap record because it belongs to the Phase 1 CPQ scope, but no public PETG product page or numeric specification was found during extraction.

## Current captured scope

| Material family | Captured public facts | Important missing fields |
|---|---|---|
| Solid PC | typical thickness range, common widths, colours/finishes, representative density, light transmission, tensile/flexural modulus, notched Izod impact, heat-deflection temperature | actual grade-specific datasheet, stock sizes, price, bending radius, thermal expansion, fire/UV/compliance evidence |
| Multiwall PC | wall-structure/thickness starting ranges, colour effects, UV-face requirement, supply-package inputs | exact section geometry, weight, U-value, load/span tables, standard widths/lengths, price |
| PMMA | cast/extruded process-route comparison; clear/frosted/coloured dimensions and public variant specifications; white-opal evidence checklist | density, mechanical properties, exact grade tolerances, price, chemical/heat/compliance evidence |
| PETG | documented gap record only | all product facts pending internal datasheet or public page |

## CPQ integration boundary

The existing CPQ demo configuration still contains placeholder commercial rates and some generic engineering assumptions. This catalog does **not** silently replace them. A production integration should map only fields with compatible meaning and evidence level:

```text
catalog fact -> validated internal material master -> versioned CPQ configuration release
```

Examples:

- public density can inform weight estimation only after confirming the offered grade;
- public thickness ranges can validate whether a requested thickness is plausibly offered;
- process-route facts can drive DFM warnings for cast vs extruded acrylic;
- PETG must remain manual-review until internal evidence is supplied;
- no public web fact should become a certified structural, fire, food-contact or safety claim without the underlying grade document.

## Validation

Run:

```bash
python3 tools/validate_sinoplastix_catalog.py
```

The validator checks required Phase 1 coverage, unique IDs, source URL ownership, `source_key` integrity, positive numeric ranges, width lists, PMMA route/variant coverage, multiwall structure coverage, and prevents the PETG gap record from silently acquiring unsupported specifications.

## Next data work

1. Add internal manufacturer datasheets as source records with document revision/date, not just URLs.
2. Split public-web facts from internal confidential commercial data so the public repository never exposes cost or price-sensitive information.
3. Add explicit units and uncertainty semantics for every numeric field.
4. Define a versioned `cpq-material-config` export generated from validated master data rather than editing demo rates manually.
5. Add change control: who approved a material datum, when, and which customer-facing outputs used that version.
