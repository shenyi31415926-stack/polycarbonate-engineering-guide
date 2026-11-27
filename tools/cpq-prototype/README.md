# B2B CPQ Structure Prototype

A dependency-free, clickable structural prototype for the first phase of the SinoPlastix engineering-polymer-sheet digital business platform.

## What it demonstrates

The prototype walks through the intended customer and internal-sales flow:

1. **Scenario selection** — choose the application, UV/outdoor exposure, performance requirements, temperature swing and load context.
2. **Geometry and fabrication input** — use a parametric rectangle, cover plate, simple L-bend, simple U-bend, or a clearly labeled simulated-DXF example.
3. **Nesting and price breakdown** — calculate bounding-box part metrics, standard-sheet fit, parts per sheet, sheet count, utilization, waste ratio, weight, process cost, packaging/CBM estimate, logistics reference and total.
4. **Quotation preview** — render a PDF-ready document structure and a structured inquiry record. Browser print can save the preview as a PDF.
5. **Admin configuration demo** — edit placeholder material, process and commercial rates to demonstrate that pricing is configuration-driven rather than hard-coded in formulas.

## Strict prototype boundaries

- Materials: solid polycarbonate, multiwall polycarbonate, cast acrylic, extruded acrylic and PETG.
- Processes: CNC/laser cutting, drilling, bending, polishing and surface/coating routes.
- Pricing uses **placeholder demonstration rates only**; they are not commercial prices.
- DXF handling is **simulated**. This prototype does not parse real DXF entities or claim production geometric accuracy.
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
- `cpq_logic.js` — dependency-free calculation logic shared by the UI and tests.
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

Before operational use, the platform still needs manufacturer-validated material data, real commercial rates, authenticated users, server-side persistence, versioned configuration, real DXF parsing, contour reconstruction, true irregular nesting, PDF generation, document storage, audit trails, approval workflows, accessibility review, security review and browser end-to-end tests.
