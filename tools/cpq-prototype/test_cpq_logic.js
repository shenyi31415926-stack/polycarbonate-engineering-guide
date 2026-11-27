(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("./cpq_logic.js"), require("./cpq_demo_config.js"));
  } else {
    root.runCpqPrototypeTests = factory(root.CpqLogic, root.CpqDemoConfig);
  }
})(typeof self !== "undefined" ? self : globalThis, function (logic, config) {
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
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

    const solidLoad = logic.calculateQuote(baseInput({ materialId: "pc-solid", designLoadKnM2: "1.5" }), config);
    assertEqual(solidLoad.spanScreening.governingSpanM, 0.36, "solid PC governing span");
    assert(solidLoad.dfmFindings.some((finding) => finding.id === "DFM-014"), "solid load screening finding");

    const multiwallLoad = logic.calculateQuote(baseInput({ designLoadKnM2: "1.5" }), config);
    assert(multiwallLoad.dfmFindings.some((finding) => finding.id === "DFM-014" && finding.severity === "manual_review"), "multiwall load requires manual evidence");

    const unsupportedThickness = logic.calculateQuote(baseInput({ thicknessMm: "7" }), config);
    assert(unsupportedThickness.manualReasons.some((reason) => reason.includes("not a configured thickness")), "unconfigured thickness should require review");

    return "CPQ prototype logic tests passed";
  };
});

if (typeof module !== "undefined" && module.exports && require.main === module) {
  console.log(module.exports());
}
