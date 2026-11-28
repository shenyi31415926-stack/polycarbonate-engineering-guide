# B2B Engineering Plastics CPQ MVP — Rules, Data Model, Pricing Formulas, and DFM Design

## 1. Design principles

1. **Configurable before hard-coded:** material properties, rates, sheet sizes, warning thresholds and commercial assumptions must be admin-maintainable.
2. **Evidence-aware:** every material property needs a source status such as verified datasheet, supplier document, internal estimate or missing.
3. **Exact only when justified:** standard simple cases can produce exact list prices; ambiguous or complex cases must degrade to manual review or a reference range.
4. **Quote reproducibility:** every inquiry stores the input, rule version, rate version, formula outputs and manual overrides.
5. **Engineering caution by default:** the system is a screening and quotation tool, not a certified structural design authority.

## 2. Core data tables

### 2.1 `material_families`

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` | uuid/key | `pc-solid` | stable key used in rules |
| `name` | string | Solid polycarbonate | customer-facing name |
| `polymer` | enum/string | PC, PMMA, PETG | base polymer |
| `structure` | enum | solid, multiwall | sheet construction |
| `density_kg_m3` | decimal | 1200 | used for weight estimate |
| `thermal_expansion_mm_mk` | decimal | 0.065 | mm per metre per °C |
| `continuous_temp_min_c` | decimal | -40 | verified or estimated |
| `continuous_temp_max_c` | decimal | 120 | grade-dependent |
| `default_uv_grade` | string | one-sided UV | not a certification by itself |
| `flame_rating_options` | json/array | `["standard","FR-grade"]` | must link evidence |
| `active` | boolean | true | deactivation preserves history |
| `source_status` | enum | verified, datasheet, estimate, missing | provenance status |
| `notes` | text | — | limitations and handling notes |

### 2.2 `material_grades`

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` | uuid/key | `pc-solid-clear-uv1` | stable grade key |
| `material_family_id` | key | `pc-solid` | parent material |
| `grade_name` | string | Clear UV1 solid PC | customer-facing |
| `colour` | string | clear | controlled vocabulary preferred |
| `surface` | string | gloss/gloss, matte, frosted | configurable |
| `functional_treatment` | array | hard-coated, anti-fog, ESD, FR | empty for standard |
| `light_transmission_pct` | decimal | 89 | nullable if unknown |
| `u_value_w_m2k` | decimal | 5.0 | mainly sheet/thickness dependent |
| `uv_protection` | string | one side / two sides / none | orientation matters |
| `flame_rating` | string | configured rating | only with evidence |
| `esd_surface_resistance` | string/decimal | — | optional functional property |
| `evidence_document_id` | key | datasheet id | links to evidence table |
| `active` | boolean | true | availability control |

### 2.3 `material_thickness_options`

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` | key | `pc-solid-10` | unique grade/thickness key |
| `material_grade_id` | key | `pc-solid-clear-uv1` | parent grade |
| `thickness_mm` | decimal | 10 | required |
| `weight_kg_m2` | decimal | 12.0 | measured/datasheet preferred |
| `min_cold_bend_radius_mm` | decimal | 1500 | can be rule-calculated for PC |
| `max_automated_span_mm` | decimal | nullable | only if validated system data exists |
| `price_per_m2` | decimal | configurable | base material price |
| `price_per_sheet` | decimal/null | configurable | optional alternative |
| `moq` | decimal | configurable | order constraint |
| `lead_time_days` | integer | configurable | commercial output |
| `available` | boolean | true | controls auto-quotation |

### 2.4 `standard_sheet_sizes`

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` | key | `pc-1220x2440` | stable key |
| `material_family_id` | key/null | `pc-solid` | null can mean generic |
| `width_mm` | integer | 1220 | sheet width |
| `length_mm` | integer | 2440 | sheet length |
| `usable_width_mm` | integer | 1200 | after trim allowance |
| `usable_length_mm` | integer | 2420 | after trim allowance |
| `edge_trim_mm` | decimal | 10 | configurable |
| `kerf_allowance_mm` | decimal | 3 | nesting allowance |
| `active` | boolean | true | availability |

### 2.5 `process_operations`

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` | key | `cnc-cutting` | stable key |
| `name` | string | CNC cutting | customer/internal name |
| `unit` | enum | m, hole, bend, m2, piece | pricing unit |
| `compatible_materials` | array/keys | PC, PMMA, PETG | compatibility constraints |
| `requires_review_expression` | rule string | optional complexity condition | e.g. dense holes |
| `active` | boolean | true | availability |

### 2.6 `process_rates`

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` | key | rate row id | unique |
| `process_operation_id` | key | drilling | operation |
| `material_family_id` | key/null | PMMA | material-specific or generic |
| `thickness_min_mm` | decimal | 0 | range start |
| `thickness_max_mm` | decimal | 10 | range end |
| `base_rate` | decimal | configurable | price per operation unit |
| `setup_fee` | decimal | configurable | per line/item |
| `minimum_charge` | decimal | configurable | avoids zero-value small jobs |
| `complexity_multiplier` | decimal | 1.0 | admin-controlled |
| `effective_from` | date | configurable | rate versioning |
| `active` | boolean | true | availability |

### 2.7 `application_rules`

| Field | Type | Notes |
|---|---|---|
| `id` | key | stable application key |
| `application_name` | string | machine guarding, greenhouse, roofing/canopy etc. |
| `priority` | integer | deterministic rule ordering |
| `condition_expression` | structured JSON | UV, impact, temperature, fire, indoor/outdoor, span/load conditions |
| `recommended_material_family` | key | initial material route |
| `recommended_grade_tags` | array | hard-coated, anti-fog, FR, diffuser etc. |
| `thickness_guidance` | text/structured | non-certified guidance or validated range |
| `required_inputs` | array | missing-information logic |
| `engineering_notes` | array | customer-safe explanations |
| `manual_review_triggers` | array | conditions that block exact automation |
| `source_status` | enum | verified, estimate, internal, missing |

### 2.8 `dfm_rules`

| Field | Type | Notes |
|---|---|---|
| `id` | key | stable DFM key |
| `name` | string | short rule name |
| `materials` | array | applicable polymers/families |
| `processes` | array | cutting/drilling/bending/polishing/coating |
| `condition_expression` | structured JSON | machine-evaluable trigger |
| `severity` | enum | info, warning, blocking, manual_review |
| `customer_message` | text | safe explanation |
| `internal_action` | text | what engineer/sales should do |
| `active` | boolean | enable/disable |

### 2.9 Quote persistence tables

Minimum viable quote persistence:

| Table | Purpose |
|---|---|
| `inquiries` | customer/contact/application/destination/status/timestamps |
| `quote_items` | material, geometry, quantity, processes, template/DXF reference |
| `quote_geometry_metrics` | area, perimeter, holes, bends, polished length, bounding box |
| `quote_nesting_results` | sheet size, sheet count, utilization, waste, assumptions |
| `quote_price_breakdowns` | material/process/package/logistics/margin/total/range/status |
| `quote_dfm_findings` | rule id, severity, message, resolution state |
| `quote_documents` | generated PDF version, snapshot path/hash |
| `configuration_versions` | material/rule/rate versions used for reproducibility |

## 3. Input normalization rules

All user inputs are normalized before calculation:

- dimensions: millimetres
- quantity: positive integer
- load: kN/m²
- temperature: °C
- perimeter/edge length: metres for pricing, millimetres for engineering checks
- weight: kilograms
- currency: configured base currency, with display currency optional later

Invalid or missing values must remain pending. The system must not silently assume quantity one, solid construction, standard tolerance or exact sheet availability.

## 4. Engineering screening calculations

### 4.1 Sheet/part area

```text
part_area_m2 = width_mm × length_mm / 1,000,000
total_part_area_m2 = part_area_m2 × quantity
```

For DXF contours, use the actual enclosed contour area rather than bounding-box area when reliable; otherwise mark geometry confidence as low.

### 4.2 Weight estimate

```text
weight_kg = total_part_area_m2 × weight_kg_m2
```

For solid sheet, `weight_kg_m2` may be estimated from density when no measured value exists:

```text
weight_kg_m2 ≈ density_kg_m3 × thickness_mm / 1000
```

For multiwall sheet, never infer weight from solid density; use thickness-specific datasheet or configured measured values.

### 4.3 Thermal movement

```text
thermal_movement_mm = thermal_expansion_mm_mk × dimension_m × temperature_swing_c
```

This is a screening movement allowance, not final installation detailing. Fastener holes, edge engagement and frame constraints require project-specific review.

### 4.4 PC cold bending screening

Configurable initial rule:

```text
min_cold_bend_radius_mm = thickness_mm × cold_bend_radius_factor
```

Initial conservative factors from the engineering knowledge base:

- PC at normal ambient temperature: 150 × thickness
- PC at low temperature: 300 × thickness

The rule must be grade- and process-specific before production use. PETG and acrylic use separate configured limits.

### 4.5 Solid-sheet span screening

The existing simply supported strip calculation can be retained only as a non-certified screening aid. It must display assumptions and must not be used as an approved structural design.

## 5. Nesting and waste model

### 5.1 Inputs

- part bounding width/length or actual 2D contour
- quantity
- sheet usable width/length
- kerf allowance
- edge trim allowance
- rotation permission
- grain/UV/orientation restriction if applicable

### 5.2 Phase 1 practical approach

For rectangular and simple template parts, use deterministic rectangle packing:

```text
parts_per_row = floor(usable_sheet_width_mm / (part_width_mm + kerf_mm))
parts_per_column = floor(usable_sheet_length_mm / (part_length_mm + kerf_mm))
parts_per_sheet_no_rotation = parts_per_row × parts_per_column
```

Also calculate with 90° rotation when permitted and select the higher yield. For DXF irregular contours, Phase 1 can use conservative bounding-box nesting unless a validated nesting engine is integrated.

```text
sheet_count = ceiling(quantity / max_parts_per_sheet)
used_sheet_area_m2 = sheet_count × usable_sheet_width_m × usable_sheet_length_m
yield_or_utilization = total_part_area_m2 / used_sheet_area_m2
waste_ratio = 1 - utilization
```

If the result uses bounding-box nesting for irregular geometry, the PDF/internal result must state that the yield is an estimate pending production nesting.

## 6. Pricing formula design

### 6.1 Material cost

Preferred initial mode for factory cut-to-size quoting:

```text
material_cost = sheet_count × standard_sheet_area_m2 × material_price_per_m2
```

Alternative configurable mode:

```text
material_cost = total_part_area_m2 × material_price_per_m2 × (1 + waste_markup_pct)
```

The active mode must be visible internally. Do not mix both methods in one quote.

### 6.2 Cutting cost

```text
cutting_cost = cutting_perimeter_m × quantity × cutting_rate_per_m × thickness_multiplier + cutting_setup_fee
```

`thickness_multiplier` comes from the applicable process-rate row or configured lookup.

### 6.3 Drilling cost

```text
drilling_cost = hole_count_per_part × quantity × drilling_rate_per_hole × hole_size_thickness_multiplier + drilling_setup_fee
```

Countersinks, threads, deep holes, tight positional tolerance or dense hole patterns trigger complexity multiplier or manual review.

### 6.4 Bending cost

```text
bending_cost = bend_count_per_part × quantity × bending_rate_per_bend × thickness_length_multiplier + bending_setup_fee
```

Simple L/U shapes may be automated. Multiple bend angles, curved bends, tight radius, multiwall bending or bends near holes trigger manual review.

### 6.5 Polishing cost

```text
polishing_cost = polished_edge_length_m × quantity × polishing_rate_per_m + polishing_setup_fee
```

Visible-face requirements may add a configured surface-quality multiplier.

### 6.6 Coating cost

```text
coating_cost = coated_area_m2 × quantity × coating_rate_per_m2 + coating_setup_fee
```

Hard-coating, anti-fog, ESD and flame-retardant grades need separate compatibility and evidence checks.

### 6.7 Packaging cost and CBM estimate

Initial configurable approximation:

```text
package_volume_m3 = max_part_length_m × max_part_width_m × estimated_stack_height_m
estimated_cbm = package_volume_m3 × package_count
packaging_cost = packaging_base_fee + estimated_cbm × packaging_rate_per_cbm
```

For sheet stacks, `estimated_stack_height_m` may be approximated from total thickness plus protective materials, with configurable packing factor. This is a logistics estimate, not a freight quote.

### 6.8 Logistics reference cost

```text
sea_reference_cost = estimated_cbm × sea_reference_rate_per_cbm
```

This should be labelled as a reference only. Actual freight depends on Incoterm, carrier, destination, season, surcharges and shipment consolidation.

### 6.9 Overhead, margin and total

```text
direct_cost = material_cost + cutting_cost + drilling_cost + bending_cost + polishing_cost + coating_cost + packaging_cost
overhead = direct_cost × overhead_pct
margin = (direct_cost + overhead) × margin_pct
total_price = direct_cost + overhead + margin + logistics_reference_cost
```

Alternatively, margin can be applied per line. The exact commercial policy must be admin-configurable and hidden from customer-facing output.

### 6.10 Manual-review reference range

When exact automation is not allowed:

```text
reference_low = calculated_total × (1 - manual_range_down_pct)
reference_high = calculated_total × (1 + manual_range_up_pct)
```

This range is a budgetary reference only. If confidence is too low because geometry or process scope is unknown, the system should show “price pending manual review” rather than a false numeric range.

## 7. Parameters that must be admin-configurable

- material price per m² or per sheet
- standard sheet sizes, trim allowance and kerf allowance
- process rates, setup fees and minimum charges
- thickness, complexity and length multipliers
- coating rates and compatibility
- packaging base fee, package rate and stack/packing factors
- overhead and margin percentages
- manual-review range percentages
- material compatibility by process
- DFM thresholds and severity levels
- quote validity days and standard commercial terms
- PDF logo, legal entity details and footer text

## 8. Plastic-specific DFM warning rules

| ID | Rule | Trigger example | Severity | Customer-safe message / action |
|---|---|---|---|---|
| DFM-001 | Hole edge distance too small | distance from hole edge to part edge < configured multiple of thickness or diameter | blocking/manual review | Increase edge distance or confirm revised geometry; small edge distances can crack during drilling or service. |
| DFM-002 | Hole diameter too small relative to thickness | hole diameter < configured minimum for material/thickness | warning/manual review | Small deep holes may crack, melt or hold poor tolerance; confirm drilling feasibility. |
| DFM-003 | Fastener hole does not allow thermal movement | outdoor/long panel with fixed screw hole smaller than calculated clearance | warning | Use oversized/slotted holes or project-specific fixing detail to accommodate expansion. |
| DFM-004 | PC cold-bend radius too tight | radius < thickness × configured factor | blocking/manual review | Increase bend radius or use thermoforming/manual engineering review. |
| DFM-005 | Bend line too close to hole or edge | distance from bend line to hole edge < configured minimum | warning/manual review | Move holes away from bend line to reduce cracking and distortion. |
| DFM-006 | Acrylic laser-cut stress risk | PMMA + laser cutting + load-bearing or exposed edges | warning | Acrylic cut edges may need stress-relief/annealing or adjusted fabrication depending on use. |
| DFM-007 | Sharp internal corner | internal corner radius below configured minimum | warning | Add a corner radius to reduce stress concentration and cracking risk. |
| DFM-008 | Part exceeds standard sheet size | bounding dimension > usable sheet dimension | manual review | Oversized parts may require joining, special sheet size or revised design. |
| DFM-009 | Multiwall bending or drilling misuse | multiwall + bending/deep machining/unsupported sealing assumptions | blocking/manual review | Multiwall sheets have hollow sections and need edge sealing/system-specific fabrication review. |
| DFM-010 | Dense hole pattern | hole count or hole area density above configured threshold | manual review | Dense drilling increases cracking, heat and cost; confirm pattern and tolerance. |
| DFM-011 | Tight tolerance incompatible with thermal movement | tolerance tighter than configured fraction of expected thermal movement | warning | Thermal expansion may exceed the requested dimensional tolerance; review use condition. |
| DFM-012 | Coating/functional layer damaged by fabrication | hard-coated/anti-fog/ESD sheet + cutting/drilling/bending | warning | Cut edges and machined areas may not retain the surface treatment; confirm protection and inspection. |
| DFM-013 | Unsupported material/process combination | e.g. incompatible coating or laser process for selected grade | blocking | Select an approved process or request engineering review. |
| DFM-014 | Excessive span/load screening result | input span exceeds screening result or required evidence missing | manual review | Structural use requires validated manufacturer data and project-specific design. |
| DFM-015 | Polished visible face requires protection | polishing or optical/visible surface selected without protective-film/handling note | info/warning | Confirm protective film, packing and inspection standard. |

These thresholds are starting product rules, not universal industry law. Each threshold must be configurable and tied to internal engineering approval.

## 9. Example calculated quote object

```json
{
  "material": {
    "family": "pc-solid",
    "grade": "clear-uv1",
    "thickness_mm": 6
  },
  "geometry": {
    "source": "template-cover-with-holes",
    "width_mm": 500,
    "length_mm": 800,
    "quantity": 40,
    "part_area_m2": 0.4,
    "cutting_perimeter_m_per_part": 2.6,
    "holes_per_part": 4,
    "bend_count_per_part": 0
  },
  "nesting": {
    "sheet_size_mm": "1220x2440",
    "sheet_count": 7,
    "utilization": 0.76,
    "confidence": "rectangle-template-estimate"
  },
  "price": {
    "material_cost": 0,
    "process_cost": 0,
    "packaging_cost": 0,
    "logistics_reference_cost": 0,
    "total": 0,
    "currency": "CNY",
    "status": "example-shape-only"
  },
  "dfm_findings": [],
  "manual_review_required": false
}
```

Numbers are intentionally zero in this example because rates must come from configuration rather than hard-coded sample pricing.

## 10. Implementation order for the framework

1. Create static IA/PRD and rules documents.
2. Implement clickable prototype with realistic sample data and fixed demonstration rates.
3. Separate demonstration configuration from core calculation logic.
4. Add browser-based validation tests for formula and DFM behaviour.
5. Only after user confirmation, implement persistence, authentication, fuller DXF fidelity/contour reconstruction and PDF generation.
