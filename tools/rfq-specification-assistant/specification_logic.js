(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.SpecificationAssistant = api;
})(typeof self !== "undefined" ? self : globalThis, function () {
  const PC_EXPANSION_MM_PER_MK = 0.065;
  const PMMA_EXPANSION_MM_PER_MK = 0.07;
  const PC_DENSITY_KG_PER_M2_PER_MM = 1.2;
  const PMMA_DENSITY_KG_PER_M2_PER_MM = 1.19;

  const MULTIWALL_WEIGHT_KG_PER_M2 = {
    4: 0.8,
    6: 1.0,
    8: 1.3,
    10: 1.5,
    16: 1.7,
    20: 2.1,
  };

  const APPLICATION_RULES = typeof module !== "undefined" && module.exports
    ? require("./application_rules.js")
    : (typeof self !== "undefined" ? self : globalThis).ApplicationRules;

  const APPLICATION_LABELS = Object.fromEntries(
    Object.entries(APPLICATION_RULES.rules).map(([key, rule]) => [key, rule.label])
  );

  function numberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function round(value, decimals = 2) {
    if (value === null || value === undefined || !Number.isFinite(value)) return null;
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  function conservativeCentimetres(millimetres) {
    return Math.floor((millimetres + 1e-6) / 10) / 100;
  }

  function thermalExpansionMm(lengthMm, temperatureSwingC, materialFamily) {
    const length = numberOrNull(lengthMm);
    const swing = numberOrNull(temperatureSwingC);
    if (!length || !swing) return null;
    const coefficient = materialFamily === "acrylic" ? PMMA_EXPANSION_MM_PER_MK : PC_EXPANSION_MM_PER_MK;
    return round(coefficient * (length / 1000) * swing, 2);
  }

  function fastenerHoleDiameterMm(screwDiameterMm, expansionMm) {
    const screw = numberOrNull(screwDiameterMm);
    if (!screw) return null;
    const documentedBaseline = screw + (screw <= 6 ? 3 : 5);
    const expansionAllowance = expansionMm ? screw + Math.ceil(expansionMm + 1) : 0;
    return Math.max(documentedBaseline, expansionAllowance);
  }

  function sheetAreaM2(widthMm, lengthMm) {
    const width = numberOrNull(widthMm);
    const length = numberOrNull(lengthMm);
    if (!width || !length) return null;
    return round((width * length) / 1_000_000, 4);
  }

  function estimateWeightKg(input) {
    const width = numberOrNull(input.widthMm);
    const length = numberOrNull(input.lengthMm);
    const quantity = numberOrNull(input.quantity) || 1;
    const thickness = numberOrNull(input.thicknessMm);
    if (!width || !length || !thickness) return null;

    let kgPerM2 = null;
    if (input.structure === "multiwall") {
      kgPerM2 = MULTIWALL_WEIGHT_KG_PER_M2[thickness] || null;
    } else if (input.materialFamily === "acrylic") {
      kgPerM2 = PMMA_DENSITY_KG_PER_M2_PER_MM * thickness;
    } else {
      kgPerM2 = PC_DENSITY_KG_PER_M2_PER_MM * thickness;
    }

    if (!kgPerM2) return null;
    return round((width / 1000) * (length / 1000) * quantity * kgPerM2, 2);
  }

  function solidPolycarbonateSpanM(thicknessMm, designLoadKnM2) {
    const thickness = numberOrNull(thicknessMm);
    const load = numberOrNull(designLoadKnM2);
    if (!thickness || !load) return null;

    const widthMm = 1000;
    const sectionModulus = (widthMm * thickness ** 2) / 6;
    const momentOfInertia = (widthMm * thickness ** 3) / 12;
    const allowableStress = 12 / 1.5;
    const elasticModulus = 2300;
    const lineLoad = load;

    const stressSpanMm = Math.sqrt((8 * sectionModulus * allowableStress) / lineLoad);
    const deflectionSpanMm = Math.cbrt((384 * elasticModulus * momentOfInertia) / (1000 * lineLoad));
    const stressSpan = conservativeCentimetres(stressSpanMm);
    const deflectionSpan = conservativeCentimetres(deflectionSpanMm);

    return {
      stressSpanM: stressSpan,
      deflectionSpanM: deflectionSpan,
      governingSpanM: Math.min(stressSpan, deflectionSpan),
      governingFactor: deflectionSpan < stressSpan ? "deflection" : "stress",
    };
  }

  function recommendationFor(input) {
    const requirements = input.requirements || [];
    const base = {
      candidate: "Application-specific sheet specification",
      startingPoint: "Confirm application, dimensions, quantity, destination and performance requirements before quoting.",
      confirmations: ["Final dimensions and tolerances", "Quantity and delivery destination", "Required documents, test reports or certificates"],
      warnings: ["This assistant produces a quotation-support starting point, not an approved structural design."],
      productLink: "https://sinoplastix.com/materials/polycarbonate/",
    };

    const rule = APPLICATION_RULES.rules[input.application];
    if (!rule) return base;

    const recommendation = {
      candidate: rule.candidate,
      startingPoint: rule.starting_point,
      confirmations: rule.confirmations,
      warnings: rule.warnings,
      productLink: rule.product_link,
    };

    for (const [requirement, override] of Object.entries(rule.requirement_overrides || {})) {
      if (requirements.includes(requirement)) {
        recommendation.candidate = override.candidate || recommendation.candidate;
        recommendation.startingPoint = override.starting_point || recommendation.startingPoint;
      }
    }

    return recommendation;
  }

  function missingInformation(input) {
    const missing = [];
    if (!input.application) missing.push("Application or end use");
    if (!input.materialFamily) missing.push("Material family preference or constraints");

    const checks = {
      thickness: [!numberOrNull(input.thicknessMm), "Target thickness or performance requirement"],
      dimensions: [!numberOrNull(input.widthMm) || !numberOrNull(input.lengthMm), "Finished sheet width and length"],
      quantity: [!numberOrNull(input.quantity), "Quantity"],
      destination: [!input.destination, "Destination country or port"],
      design_load: [!numberOrNull(input.designLoadKnM2), "Design wind/snow load"],
      temperature_swing: [!numberOrNull(input.temperatureSwingC), "Expected temperature swing"],
    };
    const requiredInputs = APPLICATION_RULES.rules[input.application]?.required_inputs || [
      "thickness", "dimensions", "quantity", "destination"
    ];

    for (const requirement of requiredInputs) {
      const check = checks[requirement];
      if (check && check[0]) missing.push(check[1]);
    }
    return missing;
  }

  function buildSpecification(input) {
    const recommendation = recommendationFor(input);
    const expansion = thermalExpansionMm(input.lengthMm, input.temperatureSwingC, input.materialFamily);
    const fastenerHole = fastenerHoleDiameterMm(input.screwDiameterMm, expansion);
    const area = sheetAreaM2(input.widthMm, input.lengthMm);
    const weight = estimateWeightKg(input);
    const span = input.materialFamily !== "acrylic" && input.structure === "solid"
      ? solidPolycarbonateSpanM(input.thicknessMm, input.designLoadKnM2)
      : null;

    return {
      input,
      recommendation,
      calculations: {
        sheetAreaM2: area,
        estimatedWeightKg: weight,
        thermalExpansionMm: expansion,
        fastenerHoleDiameterMm: fastenerHole,
        solidSheetSpan: span,
      },
      missing: missingInformation(input),
    };
  }

  function formatList(items) {
    return items && items.length ? items.map((item) => `- ${item}`).join("\n") : "- None identified";
  }

  function valueOrPending(value, unit = "") {
    return value === null || value === undefined || value === "" ? "pending" : `${value}${unit}`;
  }

  function buildEmailSummary(specification) {
    const input = specification.input;
    const calc = specification.calculations;
    const rec = specification.recommendation;
    const application = APPLICATION_LABELS[input.application] || input.application || "pending";
    const requirements = (input.requirements || []).join(", ") || "none selected";

    return [
      "POLYCARBONATE / ACRYLIC RFQ TECHNICAL SUMMARY",
      "",
      `Application: ${application}`,
      `Candidate route: ${rec.candidate}`,
      `Starting point: ${rec.startingPoint}`,
      `Product reference: ${rec.productLink}`,
      "",
      "DIMENSIONS AND ORDER INPUTS",
      `Material family: ${input.materialFamily || "pending"}`,
      `Structure: ${input.structure || "pending"}`,
      `Thickness: ${valueOrPending(numberOrNull(input.thicknessMm), " mm")}`,
      `Finished size: ${valueOrPending(numberOrNull(input.widthMm), " mm")} × ${valueOrPending(numberOrNull(input.lengthMm), " mm")}`,
      `Quantity: ${valueOrPending(numberOrNull(input.quantity))}`,
      `Functional requirements: ${requirements}`,
      `Outdoor exposure: ${input.outdoorExposure ? "yes" : "no / not specified"}`,
      `Destination: ${input.destination || "pending"}`,
      `Design load input: ${valueOrPending(numberOrNull(input.designLoadKnM2), " kN/m²")}`,
      `Temperature swing input: ${valueOrPending(numberOrNull(input.temperatureSwingC), " °C")}`,
      `Fastener diameter input: ${valueOrPending(numberOrNull(input.screwDiameterMm), " mm")}`,
      "",
      "ENGINEERING / SPECIFICATION CHECKS",
      `Estimated sheet area per piece: ${valueOrPending(calc.sheetAreaM2, " m²")}`,
      `Estimated total sheet weight: ${valueOrPending(calc.estimatedWeightKg, " kg")} (indicative only; confirm actual grade and section)`,
      `Thermal movement over length: ${valueOrPending(calc.thermalExpansionMm, " mm")} using the stated temperature swing`,
      `Starting fastener clearance hole: ${valueOrPending(calc.fastenerHoleDiameterMm, " mm")} (verify against framing system and project movement)`,
      calc.solidSheetSpan
        ? `Solid-sheet simply supported span estimate: ${calc.solidSheetSpan.governingSpanM} m (${calc.solidSheetSpan.governingFactor}-governed; non-certified screening calculation)`
        : "Solid-sheet span estimate: not applicable or inputs incomplete",
      "",
      "CONFIRM BEFORE QUOTATION",
      formatList(rec.confirmations),
      "",
      "MISSING INFORMATION",
      formatList(specification.missing),
      "",
      "LIMITATIONS",
      formatList(rec.warnings),
      "- Weight, movement and span outputs are screening aids only and must not be treated as certified engineering design or manufacturer datasheet values.",
    ].join("\n");
  }

  return {
    APPLICATION_LABELS,
    thermalExpansionMm,
    fastenerHoleDiameterMm,
    sheetAreaM2,
    estimateWeightKg,
    solidPolycarbonateSpanM,
    recommendationFor,
    missingInformation,
    buildSpecification,
    buildEmailSummary,
  };
});
