(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("./cpq_logic.js"), require("./cpq_demo_config.js"), require("./dxf_parser.js"));
  } else {
    root.runCpqPrototypeTests = factory(root.CpqLogic, root.CpqDemoConfig, root.CpqDxfParser);
  }
})(typeof self !== "undefined" ? self : globalThis, function (logic, config, dxfParser) {
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }

  function assertClose(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) > tolerance) throw new Error(`${message}: expected ${expected} ±${tolerance}, got ${actual}`);
  }

  function baseInput(overrides = {}) {
    return {
      application: "roofing-canopy",
      materialId: "pc-multiwall",
      thicknessMm: "10",
      quantity: "40",
      template: "hole-cover",
      widthMm: "500",
      lengthMm: "800",
      holesPerPart: "4",
      holeDiameterMm: "8",
      holeEdgeDistanceMm: "25",
      bendCount: "0",
      bendRadiusMm: "600",
      cornerRadiusMm: "2",
      toleranceMm: "1",
      screwDiameterMm: "6",
      temperatureSwingC: "50",
      designLoadKnM2: "",
      cuttingMethod: "cnc",
      polishedLengthMm: "0",
      coatingType: "none",
      outdoorExposure: true,
      requirements: ["uv-resistant"],
      ...overrides
    };
  }

  return function runCpqPrototypeTests() {
    const quote = logic.calculateQuote(baseInput(), config);
    assertEqual(quote.metrics.holesPerPart, 4, "template hole count");
    assertEqual(quote.metrics.partAreaM2, 0.4, "part area");
    assert(quote.metrics.cuttingPerimeterM > 2.6, "hole perimeter included in cutting length");
    assertEqual(quote.nesting.sheetSizeId, "2050x3050", "best standard sheet selected");
    assertEqual(quote.nesting.partsPerSheet, 12, "parts per sheet");
    assertEqual(quote.nesting.sheetCount, 4, "sheet count");
    assert(quote.nesting.wasteRatio > 0.3 && quote.nesting.wasteRatio < 0.4, "waste ratio range");
    assertEqual(quote.weightKg, 24, "multiwall weight estimate");
    assertEqual(quote.price.materialCost, 1800.72, "material cost includes full stock sheet trim area");

    const singlePart = logic.calculateQuote(baseInput({ quantity: "1" }), config);
    assertEqual(singlePart.nesting.sheetSizeId, "1220x2440", "single small part should use the smaller adequate stock sheet");
    assert(quote.price.total > quote.price.directCost, "total includes overhead, margin and logistics reference");
    assertEqual(quote.price.status, "automated-list-price", "standard demo case should be automated");

    const tightHole = logic.calculateQuote(baseInput({ holeEdgeDistanceMm: "5" }), config);
    assert(tightHole.dfmFindings.some((finding) => finding.id === "DFM-001"), "small hole edge distance should trigger DFM-001");
    assertEqual(tightHole.price.status, "reference-range", "manual review finding should produce reference range");

    const bentMultiwall = logic.calculateQuote(baseInput({ template: "l-bend" }), config);
    assertEqual(bentMultiwall.metrics.bendCountPerPart, 1, "L-bend template should default to one bend");
    assert(bentMultiwall.dfmFindings.some((finding) => finding.id === "DFM-009" && finding.severity === "blocking"), "bent multiwall should be blocking");
    assertEqual(bentMultiwall.price.status, "manual-required", "blocking DFM should require manual review");

    const oversized = logic.calculateQuote(baseInput({ widthMm: "3000", lengthMm: "3000" }), config);
    assertEqual(oversized.nesting.fits, false, "oversized part should not fit standard sheets");
    assert(oversized.manualReasons.some((reason) => reason.includes("standard sheet")), "oversized manual reason");

    const dxf = logic.calculateQuote(baseInput({ template: "simulated-dxf" }), config);
    assertEqual(dxf.metrics.geometryConfidence, "simulated-dxf-estimate", "simulated DXF confidence");
    assertEqual(dxf.price.status, "reference-range", "simulated DXF should not be presented as exact production pricing");

    const acrylicLaser = logic.calculateQuote(baseInput({ materialId: "pmma-cast", thicknessMm: "5", cuttingMethod: "laser" }), config);
    assert(acrylicLaser.dfmFindings.some((finding) => finding.id === "DFM-006"), "laser-cut acrylic warning");

    const pcLaser = logic.calculateQuote(baseInput({ materialId: "pc-solid", cuttingMethod: "laser" }), config);
    assert(pcLaser.dfmFindings.some((finding) => finding.id === "DFM-013" && finding.severity === "blocking"), "laser-cut polycarbonate should be blocking");
    assertEqual(pcLaser.price.status, "manual-required", "laser-cut polycarbonate must not receive automated pricing");

    const solidLoad = logic.calculateQuote(baseInput({ materialId: "pc-solid", designLoadKnM2: "1.5", spanMm: "300" }), config);
    assertEqual(solidLoad.spanScreening.governingSpanM, 0.36, "solid PC governing span");
    assert(solidLoad.dfmFindings.some((finding) => finding.id === "DFM-014" && finding.severity === "warning"), "in-limit solid load screening should warn but not force manual review");

    const solidSpanExceeded = logic.calculateQuote(baseInput({ materialId: "pc-solid", designLoadKnM2: "1.5", spanMm: "500" }), config);
    assert(solidSpanExceeded.dfmFindings.some((finding) => finding.id === "DFM-014" && finding.severity === "manual_review"), "excessive solid span should require manual review");

    const spanWithoutLoad = logic.calculateQuote(baseInput({ spanMm: "300" }), config);
    assert(spanWithoutLoad.dfmFindings.some((finding) => finding.id === "DFM-014" && finding.severity === "manual_review"), "span without load should be incomplete structural input");

    const multiwallLoad = logic.calculateQuote(baseInput({ designLoadKnM2: "1.5" }), config);
    assert(multiwallLoad.dfmFindings.some((finding) => finding.id === "DFM-014" && finding.severity === "manual_review"), "multiwall load requires manual evidence");

    const unsupportedThickness = logic.calculateQuote(baseInput({ thicknessMm: "7" }), config);
    assert(unsupportedThickness.manualReasons.some((reason) => reason.includes("not a configured thickness")), "unconfigured thickness should require review");

    const impactDiffuser = logic.recommendMaterial(config, { application: "lighting-signage", requirements: ["diffuser", "impact-resistant"] });
    assertEqual(impactDiffuser.material.id, "pc-solid", "impact resistance should take precedence over acrylic diffuser routing");

    const lightingSuggestion = logic.recommendMaterial(config, { application: "lighting-signage", requirements: ["diffuser"], thicknessMm: "10" });
    assertEqual(lightingSuggestion.suggestedThicknessMm, 3, "scenario suggestion should replace unsupported thickness");

    const missingBendRadius = logic.calculateQuote(baseInput({ materialId: "pc-solid", template: "l-bend", bendRadiusMm: "" }), config);
    assert(missingBendRadius.dfmFindings.some((finding) => finding.id === "DFM-004" && finding.severity === "manual_review"), "missing bend radius should require review");
    assertEqual(missingBendRadius.price.status, "reference-range", "missing bend radius must not receive exact automated pricing");

    const fractionalHoles = logic.calculateQuote(baseInput({ holesPerPart: "2.5" }), config);
    assertEqual(fractionalHoles.metrics, null, "fractional hole count must not produce geometry metrics");
    assert(fractionalHoles.manualReasons.some((reason) => reason.includes("holes per part")), "fractional hole count should be invalid");

    const fractionalBends = logic.calculateQuote(baseInput({ materialId: "pc-solid", template: "l-bend", bendCount: "1.5" }), config);
    assertEqual(fractionalBends.metrics, null, "fractional bend count must not produce geometry metrics");
    assert(fractionalBends.manualReasons.some((reason) => reason.includes("bend count")), "fractional bend count should be invalid");

    const noHoles = logic.calculateQuote(baseInput({ template: "rectangle", holesPerPart: "0", holeEdgeDistanceMm: "5" }), config);
    assert(!noHoles.dfmFindings.some((finding) => finding.id === "DFM-001"), "hole edge DFM should not trigger when there are no holes");

    const unmachinedZeros = logic.calculateQuote(baseInput({ template: "rectangle", holesPerPart: "0", bendCount: "0", holeDiameterMm: "0", holeEdgeDistanceMm: "0", bendRadiusMm: "0" }), config);
    assertEqual(unmachinedZeros.price.status, "automated-list-price", "zero unused machining dimensions should not force manual review");

    const zeroEdgeWithHoles = logic.calculateQuote(baseInput({ holeEdgeDistanceMm: "0" }), config);
    assert(zeroEdgeWithHoles.dfmFindings.some((finding) => finding.id === "DFM-001" && finding.severity === "manual_review"), "zero hole edge distance should trigger review when holes exist");

    const zeroEdgeBlankDiameter = logic.calculateQuote(baseInput({ holeEdgeDistanceMm: "0", holeDiameterMm: "" }), config);
    assert(zeroEdgeBlankDiameter.dfmFindings.some((finding) => finding.id === "DFM-001" && finding.severity === "manual_review"), "blank diameter should use the geometry default in edge-distance screening");
    assertEqual(zeroEdgeBlankDiameter.price.status, "reference-range", "zero edge distance must not receive automated pricing");

    const zeroRadiusWithBend = logic.calculateQuote(baseInput({ materialId: "pc-solid", template: "l-bend", bendRadiusMm: "0" }), config);
    assert(zeroRadiusWithBend.dfmFindings.some((finding) => finding.id === "DFM-004" && finding.severity === "manual_review"), "zero bend radius should trigger review when bends exist");

    const sampleDxf = [
      "0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
      "0", "SECTION", "2", "ENTITIES",
      "0", "LWPOLYLINE", "90", "4", "70", "1",
      "10", "0", "20", "0", "10", "500", "20", "0", "10", "500", "20", "800", "10", "0", "20", "800",
      "0", "CIRCLE", "10", "50", "20", "50", "40", "4",
      "0", "CIRCLE", "10", "450", "20", "50", "40", "4",
      "0", "CIRCLE", "10", "450", "20", "750", "40", "4",
      "0", "CIRCLE", "10", "50", "20", "750", "40", "4",
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const parsedDxf = dxfParser.parseDxf(sampleDxf);
    assertEqual(parsedDxf.ok, true, "sample DXF should parse");
    assertEqual(parsedDxf.widthMm, 500, "sample DXF bounding width");
    assertEqual(parsedDxf.lengthMm, 800, "sample DXF bounding length");
    assertEqual(parsedDxf.holesPerPart, 4, "sample DXF hole count");
    assertEqual(parsedDxf.holeDiameterMm, 8, "sample DXF hole diameter");
    assertClose(parsedDxf.cuttingPerimeterM, 2.7005, 0.0001, "sample DXF cutting perimeter");
    assertEqual(parsedDxf.requiresManualGeometryReview, true, "parsed DXF should retain manual review flag");
    assertEqual(parsedDxf.areaSource, "simple-closed-contour-minus-circular-holes", "closed sample contour should use net contour area");
    assertEqual(parsedDxf.boundingBoxAreaM2, 0.4, "sample DXF bounding-box area");
    assertClose(parsedDxf.partAreaM2, 0.3998, 0.00001, "sample DXF net contour area should subtract circular holes");

    const lShapeDxf = [
      "0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
      "0", "SECTION", "2", "ENTITIES",
      "0", "LWPOLYLINE", "90", "6", "70", "1",
      "10", "0", "20", "0", "10", "400", "20", "0", "10", "400", "20", "200",
      "10", "200", "20", "200", "10", "200", "20", "400", "10", "0", "20", "400",
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const parsedLShape = dxfParser.parseDxf(lShapeDxf);
    assertEqual(parsedLShape.ok, true, "L-shaped closed polyline should parse");
    assertEqual(parsedLShape.areaSource, "simple-closed-contour-minus-circular-holes", "L-shape should use contour area");
    assertEqual(parsedLShape.boundingBoxAreaM2, 0.16, "L-shape bounding-box area");
    assertEqual(parsedLShape.partAreaM2, 0.12, "L-shape contour area should be lower than bounding box");
    assertClose(parsedLShape.cuttingPerimeterM, 1.6, 0.0001, "L-shape cutting perimeter");

    const bulgedLShape = dxfParser.parseDxf(lShapeDxf.replace("70\n1\n10", "70\n1\n42\n0.5\n10"));
    assertEqual(bulgedLShape.areaSource, "bounding-box", "bulged polyline must not use straight-chord contour area");
    assertEqual(bulgedLShape.partAreaM2, 0.16, "bulged polyline should fall back to bounding-box area");

    const lineEntity = (x1, y1, x2, y2) => ["0", "LINE", "10", String(x1), "20", String(y1), "11", String(x2), "21", String(y2)];
    const lShapeSegments = [
      [0, 0, 400, 0], [400, 0, 400, 200], [400, 200, 200, 200],
      [200, 200, 200, 400], [200, 400, 0, 400], [0, 400, 0, 0]
    ];
    const lineLShapeDxf = [
      "0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
      "0", "SECTION", "2", "ENTITIES",
      ...lShapeSegments.flatMap((segment) => lineEntity(...segment)),
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const parsedLineLShape = dxfParser.parseDxf(lineLShapeDxf);
    assertEqual(parsedLineLShape.ok, true, "LINE-chain L-shape should parse");
    assertEqual(parsedLineLShape.areaSource, "simple-closed-contour-minus-circular-holes", "connected LINE loop should use contour area");
    assertEqual(parsedLineLShape.partAreaM2, 0.12, "connected LINE loop contour area");

    const openLineDxf = [
      "0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
      "0", "SECTION", "2", "ENTITIES",
      ...lShapeSegments.slice(0, 5).flatMap((segment) => lineEntity(...segment)),
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const parsedOpenLines = dxfParser.parseDxf(openLineDxf);
    assertEqual(parsedOpenLines.areaSource, "bounding-box", "open LINE chain must fall back to bounding-box area");
    assert(parsedOpenLines.warnings.some((warning) => warning.includes("could not be reconstructed")), "open LINE chain should warn about contour reconstruction");

    const inchRectangleDxf = [
      "0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "1", "0", "ENDSEC",
      "0", "SECTION", "2", "ENTITIES",
      "0", "LWPOLYLINE", "90", "4", "70", "1",
      "10", "0", "20", "0", "10", "10", "20", "0", "10", "10", "20", "20", "10", "0", "20", "20",
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const parsedInches = dxfParser.parseDxf(inchRectangleDxf);
    assertEqual(parsedInches.widthMm, 254, "inch DXF width should be converted to millimetres");
    assertEqual(parsedInches.lengthMm, 508, "inch DXF length should be converted to millimetres");
    assertClose(parsedInches.partAreaM2, 0.12903, 0.00001, "inch DXF contour area should be converted to square metres");
    assertClose(parsedInches.cuttingPerimeterM, 1.524, 0.0001, "inch DXF perimeter should be converted to metres");

    const polylineDxf = (points, extraEntities = []) => [
      "0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
      "0", "SECTION", "2", "ENTITIES",
      "0", "LWPOLYLINE", "90", String(points.length), "70", "1",
      ...points.flatMap(([x, y]) => ["10", String(x), "20", String(y)]),
      ...extraEntities,
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const circleEntity = (x, y, radius) => ["0", "CIRCLE", "10", String(x), "20", String(y), "40", String(radius)];

    const crossingCutout = dxfParser.parseDxf(polylineDxf([[0, 0], [100, 0], [100, 100], [0, 100]], circleEntity(5, 50, 10)));
    assertEqual(crossingCutout.areaSource, "bounding-box", "circle crossing contour must not be subtracted as a complete hole");
    assert(crossingCutout.warnings.some((warning) => warning.includes("touches or crosses")), "crossing circular cutout should warn");

    const overlappingHoles = dxfParser.parseDxf(polylineDxf([[0, 0], [100, 0], [100, 100], [0, 100]], [...circleEntity(40, 50, 10), ...circleEntity(50, 50, 10)]));
    assertEqual(overlappingHoles.areaSource, "bounding-box", "overlapping holes must not use simple subtraction");
    assert(overlappingHoles.warnings.some((warning) => warning.includes("Overlapping circular holes")), "overlapping holes should warn");

    const largeOffset = dxfParser.parseDxf(polylineDxf([[1e9, 1e9], [1e9 + 200, 1e9], [1e9 + 200, 1e9 + 200], [1e9, 1e9 + 200]]));
    assertEqual(largeOffset.areaSource, "simple-closed-contour-minus-circular-holes", "large drawing offsets should still use contour area");
    assertClose(largeOffset.partAreaM2, 0.04, 0.00001, "large-offset polygon area should remain position-independent");

    const bowtie = dxfParser.parseDxf(polylineDxf([[0, 0], [100, 100], [100, 0], [0, 100]]));
    assertEqual(bowtie.areaSource, "bounding-box", "self-intersecting contour must not use net area");
    assert(bowtie.warnings.some((warning) => warning.includes("self-intersects")), "self-intersecting contour should warn");

    const uploadedDxfQuote = logic.calculateQuote(baseInput({ template: "uploaded-dxf", widthMm: "", lengthMm: "", dxfAnalysis: parsedDxf }), config);
    assertEqual(uploadedDxfQuote.metrics.widthMm, 500, "uploaded DXF quote width");
    assertEqual(uploadedDxfQuote.metrics.holesPerPart, 4, "uploaded DXF quote hole count");
    assertEqual(uploadedDxfQuote.metrics.geometryConfidence, "basic-dxf-bounding-box", "uploaded DXF confidence");
    assert(uploadedDxfQuote.nesting.method.includes("irregular contour nesting not performed"), "DXF nesting must not claim true irregular nesting");
    assertEqual(uploadedDxfQuote.price.status, "reference-range", "basic parsed DXF should produce reference-range pricing only");
    assert(uploadedDxfQuote.manualReasons.some((reason) => reason.includes("bounding-box geometry only")), "parsed DXF manual reason should disclose bounding-box limitation");

    const invalidDxf = dxfParser.parseDxf("not a dxf");
    assertEqual(invalidDxf.ok, false, "invalid DXF should fail parsing");
    const invalidDxfQuote = logic.calculateQuote(baseInput({ template: "uploaded-dxf", dxfAnalysis: invalidDxf }), config);
    assertEqual(invalidDxfQuote.metrics, null, "invalid DXF must not produce geometry metrics");
    assert(invalidDxfQuote.manualReasons.some((reason) => reason.includes("DXF parsing failed")), "invalid DXF should produce an explicit parsing manual reason");
    assertEqual(invalidDxfQuote.price.status, "manual-required", "invalid DXF should be manual-required");

    const extremeArcDxf = [
      "0", "SECTION", "2", "ENTITIES",
      "0", "ARC", "10", "0", "20", "0", "40", "10", "50", "0", "51", "-1e30",
      "0", "ENDSEC", "0", "EOF"
    ].join("\n");
    const extremeArc = dxfParser.parseDxf(extremeArcDxf);
    assertEqual(extremeArc.ok, true, "extremely negative arc angle should normalize without hanging");
    assert(extremeArc.cuttingPerimeterM > 0, "normalized arc should contribute a positive perimeter");

    return "CPQ prototype logic tests passed";
  };
});

if (typeof module !== "undefined" && module.exports && require.main === module) {
  console.log(module.exports());
}
