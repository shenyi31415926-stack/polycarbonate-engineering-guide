(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("./specification_logic.js"));
  } else {
    root.runSpecificationAssistantTests = factory(root.SpecificationAssistant);
  }
})(typeof self !== "undefined" ? self : globalThis, function (assistant) {
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  return function runSpecificationAssistantTests() {
    assertEqual(assistant.thermalExpansionMm(3000, 60, "polycarbonate"), 11.7, "PC thermal expansion");
    assertEqual(assistant.thermalExpansionMm(3000, 60, "acrylic"), 12.6, "acrylic thermal expansion");
    assertEqual(assistant.thermalExpansionMm(3000, 0, "polycarbonate"), 0, "zero temperature swing");
    assertEqual(assistant.fastenerHoleDiameterMm(6, 11.7), 19, "expansion-driven fastener clearance");
    assertEqual(assistant.fastenerHoleDiameterMm(8, 3), 13, "documented fastener baseline");
    assertEqual(assistant.sheetAreaM2(1000, 2000), 2, "sheet area");

    const weight = assistant.estimateWeightKg({
      materialFamily: "polycarbonate",
      structure: "solid",
      thicknessMm: 10,
      widthMm: 1000,
      lengthMm: 2000,
      quantity: 5,
    });
    assertEqual(weight, 120, "solid PC weight estimate");

    const span = assistant.solidPolycarbonateSpanM(10, 1.5);
    assertEqual(span.governingSpanM, 0.36, "solid sheet governing span");
    assertEqual(span.governingFactor, "deflection", "solid sheet governing factor");

    const machineGuard = assistant.recommendationFor({
      application: "machine-guarding",
      requirements: ["impact-resistant"],
    });
    assert(machineGuard.candidate.includes("Solid polycarbonate"), "machine guarding should prefer solid PC");
    assert(machineGuard.confirmations.some((item) => item.includes("safety")), "machine guarding should ask for safety requirements");

    const specification = assistant.buildSpecification({
      application: "roofing-canopy",
      materialFamily: "polycarbonate",
      structure: "multiwall",
      thicknessMm: 10,
      widthMm: 1000,
      lengthMm: 2000,
      quantity: 10,
      temperatureSwingC: 50,
      screwDiameterMm: 6,
      destination: "Hamburg, Germany",
      requirements: ["uv-resistant"],
    });
    assert(specification.calculations.estimatedWeightKg > 0, "multiwall weight should be estimated");
    assertEqual(specification.calculations.thermalExpansionMm, 6.5, "roofing thermal movement");
    assert(specification.missing.some((item) => item.includes("Design wind/snow load")), "roofing should require design load");

    assertEqual(assistant.solidPolycarbonateSpanM(10, -1.5), null, "negative load must not produce a span");
    assertEqual(assistant.estimateWeightKg({
      materialFamily: "polycarbonate",
      structure: "solid",
      thicknessMm: 10,
      widthMm: 1000,
      lengthMm: 2000,
      quantity: 1.5,
    }), null, "fractional quantity must not produce order weight");
    assertEqual(assistant.estimateWeightKg({
      materialFamily: "polycarbonate",
      thicknessMm: 10,
      widthMm: 1000,
      lengthMm: 2000,
      quantity: 5,
    }), null, "unspecified structure must not default to solid weight");

    const summary = assistant.buildEmailSummary(specification);
    assert(summary.includes("POLYCARBONATE / ACRYLIC RFQ TECHNICAL SUMMARY"), "summary title");
    assert(summary.includes("Multiwall polycarbonate roofing sheet"), "summary candidate");
    assert(summary.includes("must not be treated as certified engineering design"), "summary limitation");

    return "RFQ specification assistant tests passed";
  };
});

if (typeof module !== "undefined" && module.exports && require.main === module) {
  console.log(module.exports());
}
