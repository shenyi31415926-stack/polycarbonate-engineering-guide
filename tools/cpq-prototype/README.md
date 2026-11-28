# B2B CPQ Structure Prototype

A dependency-free, clickable structural prototype for the first phase of the SinoPlastix engineering-polymer-sheet digital business platform.

## What it demonstrates

The prototype walks through the intended customer and internal-sales flow:

1. **Scenario selection** — choose the application, UV/outdoor exposure, performance requirements, temperature swing and load context.
2. **Geometry and fabrication input** — use a parametric rectangle, cover plate, simple L-bend, simple U-bend, a bounded real DXF import, or a clearly labeled simulated-DXF example.
3. **Nesting and price breakdown** — calculate bounding-box part metrics, standard-sheet fit, parts per sheet, sheet count, utilization, waste ratio, weight, thermal-movement screening, solid-polycarbonate span screening, process cost, packaging/CBM estimate, logistics reference and total.
4. **Quotation preview** — render a PDF-ready document structure and a structured inquiry record. Browser print can save the preview as a PDF.
5. **Admin configuration demo** — edit placeholder material, process and commercial rates to demonstrate that pricing is configuration-driven rather than hard-coded in formulas.

## Strict prototype boundaries

- Materials: solid polycarbonate, multiwall polycarbonate, cast acrylic, extruded acrylic and PETG.
- Processes: CNC/laser cutting, drilling, bending, polishing and surface/coating routes.
- Pricing uses **placeholder demonstration rates only**; they are not commercial prices.
- Real DXF import is deliberately bounded: ASCII DXF `LINE`, `LWPOLYLINE`, `CIRCLE` and `ARC` entities are parsed for bounding box, estimated perimeter and circular-hole count. Hole classification is heuristic, bulges/curves are not faithfully reconstructed, and pricing remains a **manual-review bounding-box estimate** rather than production geometric accuracy.
- No ERP, inventory, online payment, 3D CAD or multi-factory bidding.
- Output is not certified engineering design, a structural approval, a final grade confirmation or a production-ready quotation.

## 80/20 behavior

The prototype distinguishes:

- `automated-list-price`: standard template case without manual-review findings.
- `reference-range`: cases requiring commercial or engineering review, with a reference low/high range.
- `manual-required`: blocking cases such as bending multiwall polycarbonate.

## Files

- `index.html` — interactive single-page prototype.
- `cpq_demo_config.js` — editable demonstration configuration for materials, sheet sizes, process rates and commercial assumptions.
- `dxf_parser.js` — bounded ASCII DXF parser for common 2D entities.
- `cpq_logic.js` — dependency-free calculation logic shared by the UI and tests.
- `sample-cover-plate.dxf` — minimal rectangle-with-four-holes fixture that can be uploaded in the prototype.
- `test_cpq_logic.js` — browser-executable logic tests.
- `test-runner.html` — headless/browser test runner.

## Local validation

Open `test-runner.html` in a browser, or run:

```bash
google-chrome --headless --no-sandbox --disable-gpu \
  --dump-dom file:///absolute/path/to/test-runner.html | grep data-test-status
```

Expected result: `data-test-status="passed"`.

## Production gaps intentionally left open

Before operational use, the platform still needs manufacturer-validated material data, real commercial rates, authenticated users, server-side persistence, versioned configuration, fuller DXF/entity fidelity, contour reconstruction, reliable hole/contour topology, true irregular nesting, PDF generation, document storage, audit trails, approval workflows, accessibility review, security review and browser end-to-end tests.
