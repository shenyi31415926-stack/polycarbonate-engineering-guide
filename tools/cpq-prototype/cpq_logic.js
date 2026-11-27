(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CpqLogic = api;
})(typeof self !== "undefined" ? self : globalThis, function () {
  function num(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function positive(value, integer = false) {
    const parsed = num(value);
    if (parsed === null || parsed <= 0) return null;
    if (integer && !Number.isInteger(parsed)) return null;
    return parsed;
  }

  function nonNegative(value) {
    const parsed = num(value);
    return parsed !== null && parsed >= 0 ? parsed : null;
  }

  function round(value, digits = 2) {
    if (!Number.isFinite(value)) return null;
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function materialById(config, id) {
    return config.materials.find((material) => material.id === id) || null;
  }

  function applicationGuidance(config, application) {
    return config.applicationGuidance[application] || null;
  }

  function conservativeCm(spanMm) {
    return Math.floor((spanMm + 1e-6) / 10) / 100;
  }

  function solidPolycarbonateSpanM(thicknessMm, loadKnM2, material) {
    if (!material || material.polymer !== "PC" || material.structure !== "solid") return null;
    const thicknessKey = String(thicknessMm);
    const sectionModulus = material.sectionModulusMm3PerM ? material.sectionModulusMm3PerM[thicknessKey] : null;
    const momentOfInertia = material.momentOfInertiaMm4PerM ? material.momentOfInertiaMm4PerM[thicknessKey] : null;
    const allowableStress = material.allowableFlexuralStressMpa;
    if (!sectionModulus || !momentOfInertia || !allowableStress || !loadKnM2 || loadKnM2 <= 0) return null;

    const stressSpanMm = Math.sqrt((8 * sectionModulus * allowableStress) / loadKnM2);
    const modulusMpa = 2300;
    const deflectionSpanMm = Math.cbrt((384 * modulusMpa * momentOfInertia) / (1000 * loadKnM2));
    const stressSpanM = conservativeCm(stressSpanMm);
    const deflectionSpanM = conservativeCm(deflectionSpanMm);
    return {
      stressSpanM,
      deflectionSpanM,
      governingSpanM: Math.min(stressSpanM, deflectionSpanM),
      governingFactor: deflectionSpanM < stressSpanM ? "deflection" : "stress",
      basis: "solid rectangular-section geometric baseline; validate manufacturer data before production use"
    };
  }

  function recommendMaterial(config, input) {
    const guidance = applicationGuidance(config, input.application);
    const requirements = input.requirements || [];
    let materialId = guidance ? guidance.material : "pc-solid";

    if ((input.application === "display-retail" || input.application === "lighting-signage" || input.application === "interior-partition") && requirements.includes("impact-resistant")) {
      materialId = "pc-solid";
    }
    if (input.application === "lighting-signage" && requirements.includes("diffuser")) {
      materialId = "pmma-extruded";
    }
    if (input.application === "greenhouse" || input.application === "roofing-canopy") {
      materialId = "pc-multiwall";
    }

    const material = materialById(config, materialId) || config.materials[0];
    const thickness = positive(input.thicknessMm) || (guidance ? guidance.thicknessMm : material.thicknessesMm[0]);
    const reasons = [
      material.note,
      "This is a prototype recommendation using demonstration data, not a certified engineering approval."
    ];
    const designLoad = positive(input.designLoadKnM2);
    if (designLoad) {
      const span = solidPolycarbonateSpanM(thickness, designLoad, material);
      if (span) {
        reasons.push(`Preliminary solid-PC span screening at ${thickness}mm and ${designLoad} kN/m²: ${span.governingSpanM}m governing span (${span.governingFactor}-governed); validate frame, fixing and manufacturer data.`);
      } else {
        reasons.push("Span/load performance for this material route cannot be inferred from solid-sheet geometry and requires manufacturer-specific structural data or engineering review.");
      }
    }
    return {
      material,
      suggestedThicknessMm: thickness,
      title: guidance ? guidance.title : "Custom application",
      summary: guidance ? guidance.summary : "Confirm application requirements before material selection.",
      reasons
    };
  }

  function normalizeInput(raw) {
    const input = { ...raw };
    input.thicknessMm = positive(raw.thicknessMm);
    input.widthMm = positive(raw.widthMm);
    input.lengthMm = positive(raw.lengthMm);
    input.quantity = positive(raw.quantity, true);
    input.holesPerPart = nonNegative(raw.holesPerPart);
    input.holeDiameterMm = positive(raw.holeDiameterMm);
    input.holeEdgeDistanceMm = positive(raw.holeEdgeDistanceMm);
    input.bendCount = nonNegative(raw.bendCount);
    input.bendRadiusMm = positive(raw.bendRadiusMm);
    input.polishedLengthMm = nonNegative(raw.polishedLengthMm);
    input.temperatureSwingC = nonNegative(raw.temperatureSwingC);
    input.designLoadKnM2 = positive(raw.designLoadKnM2);
    input.screwDiameterMm = positive(raw.screwDiameterMm);
    input.toleranceMm = positive(raw.toleranceMm);
    input.cornerRadiusMm = nonNegative(raw.cornerRadiusMm);
    input.requirements = raw.requirements || [];
    return input;
  }

  function defaultTemplateMetrics(input) {
    const width = input.widthMm;
    const length = input.lengthMm;
    if (!width || !length) return null;

    let holes = input.holesPerPart;
    let bends = input.bendCount;
    if (input.template === "hole-cover") {
      holes = holes === null ? 4 : holes;
      bends = bends || 0;
    } else if (input.template === "l-bend") {
      holes = holes || 0;
      bends = Math.max(1, bends || 0);
    } else if (input.template === "u-bend") {
      holes = holes || 0;
      bends = Math.max(2, bends || 0);
    } else {
      holes = holes || 0;
      bends = bends || 0;
    }

    const holeDiameter = input.holeDiameterMm || 6;
    const outerPerimeterMm = 2 * (width + length);
    const holePerimeterMm = holes * Math.PI * holeDiameter;
    return {
      widthMm: width,
      lengthMm: length,
      partAreaM2: round((width * length) / 1_000_000, 5),
      outerPerimeterM: round(outerPerimeterMm / 1000, 4),
      cuttingPerimeterM: round((outerPerimeterMm + holePerimeterMm) / 1000, 4),
      holesPerPart: holes,
      holeDiameterMm: holeDiameter,
      bendCountPerPart: bends,
      geometryConfidence: input.template === "simulated-dxf" ? "simulated-dxf-estimate" : "parametric-template",
      requiresManualGeometryReview: input.template === "simulated-dxf"
    };
  }

  function thermalMovementMm(input, material) {
    if (!input.lengthMm || input.temperatureSwingC === null || input.temperatureSwingC === undefined) return null;
    return round((material.thermalExpansionMmMk || 0) * (input.lengthMm / 1000) * input.temperatureSwingC, 2);
  }

  function weightKg(input, metrics, material) {
    if (!metrics || !input.quantity || !input.thicknessMm) return null;
    let kgPerM2 = null;
    if (material.structure === "multiwall") {
      kgPerM2 = material.weightsKgM2 ? material.weightsKgM2[String(input.thicknessMm)] : null;
    } else if (material.densityKgM3) {
      kgPerM2 = material.densityKgM3 * input.thicknessMm / 1000;
    }
    if (!kgPerM2) return null;
    return round(metrics.partAreaM2 * input.quantity * kgPerM2, 2);
  }

  function nesting(input, metrics, config) {
    if (!metrics || !input.quantity) return null;
    let best = null;

    for (const sheet of config.sheetSizes) {
      for (const rotate of [false, true]) {
        const partW = rotate ? metrics.lengthMm : metrics.widthMm;
        const partL = rotate ? metrics.widthMm : metrics.lengthMm;
        const across = Math.floor((sheet.usableWidthMm + sheet.kerfMm) / (partW + sheet.kerfMm));
        const down = Math.floor((sheet.usableLengthMm + sheet.kerfMm) / (partL + sheet.kerfMm));
        const partsPerSheet = across * down;
        if (!partsPerSheet) continue;
        const sheetCount = Math.ceil(input.quantity / partsPerSheet);
        const stockAreaMm2 = sheet.widthMm * sheet.lengthMm;
        const candidate = { sheet, rotate, partsPerSheet, across, down, sheetCount, stockAreaMm2 };
        if (!best
          || sheetCount < best.sheetCount
          || (sheetCount === best.sheetCount && stockAreaMm2 < best.stockAreaMm2)
          || (sheetCount === best.sheetCount && stockAreaMm2 === best.stockAreaMm2 && partsPerSheet > best.partsPerSheet)) {
          best = candidate;
        }
      }
    }

    if (!best) {
      return {
        fits: false,
        manualReviewReason: "Part does not fit within configured standard sheet sizes."
      };
    }

    const sheetCount = Math.ceil(input.quantity / best.partsPerSheet);
    const sheetAreaM2 = (best.sheet.usableWidthMm / 1000) * (best.sheet.usableLengthMm / 1000);
    const totalPartArea = metrics.partAreaM2 * input.quantity;
    const utilization = totalPartArea / (sheetAreaM2 * sheetCount);
    return {
      fits: true,
      sheetSizeId: best.sheet.id,
      usableWidthMm: best.sheet.usableWidthMm,
      usableLengthMm: best.sheet.usableLengthMm,
      rotate: best.rotate,
      partsPerSheet: best.partsPerSheet,
      across: best.across,
      down: best.down,
      sheetCount,
      sheetAreaM2: round(sheetAreaM2, 4),
      utilization: round(utilization, 4),
      wasteRatio: round(1 - utilization, 4),
      method: metrics.geometryConfidence === "simulated-dxf-estimate" ? "bounding-box estimate from simulated DXF" : "rectangle template nesting"
    };
  }

  function dfmFindings(input, metrics, material, config) {
    if (!metrics || !material) return [];
    const findings = [];
    const add = (id, severity, message, action) => findings.push({ id, severity, message, action });
    const t = input.thicknessMm || 0;
    const rules = config.dfm;

    if (input.holeEdgeDistanceMm && input.holeDiameterMm) {
      const minimum = Math.max(rules.minHoleEdgeToThicknessFactor * t, 2 * input.holeDiameterMm);
      if (input.holeEdgeDistanceMm < minimum) {
        add("DFM-001", "manual_review", `Hole edge distance ${input.holeEdgeDistanceMm}mm is below the prototype minimum of ${round(minimum, 1)}mm.`, "Increase edge distance or request engineering confirmation.");
      }
    }

    if (input.holeDiameterMm && input.holeDiameterMm < rules.minHoleDiameterToThicknessFactor * t) {
      add("DFM-002", "warning", `Hole diameter ${input.holeDiameterMm}mm is small relative to ${t}mm thickness.`, "Confirm drilling quality, cracking risk and tolerance.");
    }

    if (input.outdoorExposure && input.screwDiameterMm && input.temperatureSwingC !== null && input.temperatureSwingC !== undefined) {
      const movement = thermalMovementMm(input, material) || 0;
      const baseline = input.screwDiameterMm + (input.screwDiameterMm <= 6 ? 3 : 5);
      const movementBased = input.screwDiameterMm + Math.ceil(movement + 1);
      const recommended = Math.max(baseline, movementBased);
      add("DFM-003", recommended > baseline ? "warning" : "info", `Outdoor thermal movement suggests starting fastener clearance near ${recommended}mm.`, "Verify final fixing detail against the frame system.");
    }

    if (metrics.bendCountPerPart > 0) {
      if (material.structure === "multiwall") {
        add("DFM-009", "blocking", "Bending multiwall sheet is outside automated scope.", "Use solid sheet or request manual engineering review.");
      } else if (material.bendFactor && input.bendRadiusMm && input.bendRadiusMm < material.bendFactor * t) {
        add("DFM-004", "manual_review", `Bend radius ${input.bendRadiusMm}mm is below the prototype minimum radius of ${material.bendFactor * t}mm.`, "Increase bend radius or use controlled forming review.");
      }
    }

    if (material.polymer === "PMMA" && input.cuttingMethod === "laser") {
      add("DFM-006", "warning", "Laser-cut acrylic edges can retain stress in load-bearing or exposed applications.", "Confirm edge quality, stress relief and end-use requirements.");
    }

    if (material.polymer === "PC" && input.cuttingMethod === "laser") {
      add("DFM-013", "blocking", "Laser cutting is not an approved polycarbonate process in the prototype rules because it can produce poor edges and hazardous fumes.", "Select CNC/mechanical cutting or request engineering review.");
    }

    if (input.cornerRadiusMm !== null && input.cornerRadiusMm !== undefined && input.cornerRadiusMm < rules.minInternalCornerRadiusMm) {
      add("DFM-007", "warning", "Very sharp internal corners increase stress concentration.", "Add a small internal radius where function allows.");
    }

    if (metrics.partAreaM2 && metrics.holesPerPart > 0) {
      const areaPerHole = metrics.partAreaM2 / metrics.holesPerPart;
      if (areaPerHole < rules.denseHoleAreaM2PerHole) {
        add("DFM-010", "manual_review", "Dense hole pattern exceeds the prototype automation threshold.", "Review drilling time, cracking risk and dimensional tolerance.");
      }
    }

    if (input.toleranceMm && input.temperatureSwingC) {
      const movement = thermalMovementMm(input, material) || 0;
      if (input.toleranceMm < movement / 2) {
        add("DFM-011", "warning", "Requested tolerance is tight relative to expected thermal movement.", "Confirm service temperature range and measurement condition.");
      }
    }

    if ((input.coatingType || "") !== "none" && (metrics.holesPerPart > 0 || metrics.bendCountPerPart > 0)) {
      add("DFM-012", "info", "Cut edges, drilled holes or bent areas may not retain the selected surface treatment.", "Confirm coating scope, edge protection and inspection requirement.");
    }

    if (input.designLoadKnM2) {
      const span = solidPolycarbonateSpanM(input.thicknessMm, input.designLoadKnM2, material);
      if (span) {
        add("DFM-014", "warning", `Preliminary solid-PC span screening gives a ${span.governingSpanM}m governing span (${span.governingFactor}-governed) at ${input.designLoadKnM2} kN/m².`, "Validate frame spacing, fixing system, edge engagement and manufacturer data before use.");
      } else {
        add("DFM-014", "manual_review", "Span/load performance for this material route cannot be inferred from solid-sheet geometry.", "Obtain manufacturer-specific structural data or complete engineering review before quoting structural use.");
      }
    }

    return findings;
  }

  function processCosts(input, metrics, material, config) {
    if (!metrics || !input.quantity) return null;
    const rates = config.processRates;
    const qty = input.quantity;
    const cuttingRate = rates.cutting;
    const withMinimum = (rate, usage) => Math.max(rate.minimumCharge, rate.setupFee + usage);
    const cutting = withMinimum(cuttingRate, metrics.cuttingPerimeterM * qty * cuttingRate.ratePerM);

    const drilling = metrics.holesPerPart > 0
      ? withMinimum(rates.drilling, metrics.holesPerPart * qty * rates.drilling.ratePerHole)
      : 0;
    const bending = metrics.bendCountPerPart > 0
      ? withMinimum(rates.bending, metrics.bendCountPerPart * qty * rates.bending.ratePerBend)
      : 0;
    const polishedLengthM = (input.polishedLengthMm || 0) / 1000;
    const polishing = polishedLengthM > 0
      ? withMinimum(rates.polishing, polishedLengthM * qty * rates.polishing.ratePerM)
      : 0;
    const coating = input.coatingType && input.coatingType !== "none"
      ? withMinimum(rates.coating, metrics.partAreaM2 * qty * rates.coating.ratePerM2)
      : 0;

    return {
      cutting: round(cutting),
      drilling: round(drilling),
      bending: round(bending),
      polishing: round(polishing),
      coating: round(coating)
    };
  }

  function packagingAndLogistics(input, metrics, material, config) {
    if (!metrics || !input.quantity || !input.thicknessMm) return null;
    const stackHeightM = Math.max(0.05, (input.thicknessMm * input.quantity / 1000) * config.commercial.packingFactor);
    const cbm = (metrics.widthMm / 1000) * (metrics.lengthMm / 1000) * stackHeightM;
    return {
      estimatedCbm: round(cbm, 4),
      packagingCost: round(config.commercial.packagingBaseFee + cbm * config.commercial.packagingRatePerCbm),
      logisticsReferenceCost: round(cbm * config.commercial.seaReferenceRatePerCbm)
    };
  }

  function calculateQuote(rawInput, config) {
    const input = normalizeInput(rawInput);
    const recommendation = recommendMaterial(config, input);
    const material = input.materialId ? materialById(config, input.materialId) : recommendation.material;
    const metrics = defaultTemplateMetrics(input);
    const nest = nesting(input, metrics, config);
    const findings = dfmFindings(input, metrics, material, config);
    const thermalMovement = material ? thermalMovementMm(input, material) : null;
    const weight = material ? weightKg(input, metrics, material) : null;
    const costs = processCosts(input, metrics, material, config);
    const packaging = packagingAndLogistics(input, metrics, material, config);

    const manualReasons = [];
    if (!input.materialId) manualReasons.push("Material not explicitly selected");
    if (material && input.thicknessMm && material.thicknessesMm && !material.thicknessesMm.includes(input.thicknessMm)) manualReasons.push(`${input.thicknessMm}mm is not a configured thickness for ${material.name}`);
    if (!metrics) manualReasons.push("Geometry incomplete");
    if (metrics && metrics.requiresManualGeometryReview) manualReasons.push("Simulated DXF requires real parser validation in production");
    if (nest && !nest.fits) manualReasons.push(nest.manualReviewReason);
    for (const finding of findings) {
      if (finding.severity === "manual_review" || finding.severity === "blocking") manualReasons.push(`${finding.id}: ${finding.message}`);
    }

    let price = null;
    if (metrics && nest && nest.fits && costs && packaging && material) {
      const sheetArea = nest.sheetAreaM2;
      const materialCost = nest.sheetCount * sheetArea * material.pricePerM2;
      const processCost = costs.cutting + costs.drilling + costs.bending + costs.polishing + costs.coating;
      const direct = materialCost + processCost + packaging.packagingCost;
      const overhead = direct * config.commercial.overheadPct;
      const margin = (direct + overhead) * config.commercial.marginPct;
      const total = direct + overhead + margin + packaging.logisticsReferenceCost;
      const hasBlocking = findings.some((finding) => finding.severity === "blocking");
      const hasManual = manualReasons.length > 0;
      price = {
        materialCost: round(materialCost),
        processCost: round(processCost),
        packagingCost: packaging.packagingCost,
        logisticsReferenceCost: packaging.logisticsReferenceCost,
        directCost: round(direct),
        overhead: round(overhead),
        margin: round(margin),
        total: round(total),
        status: hasBlocking ? "manual-required" : hasManual ? "reference-range" : "automated-list-price",
        referenceLow: round(total * (1 - config.commercial.manualRangeDownPct)),
        referenceHigh: round(total * (1 + config.commercial.manualRangeUpPct))
      };
    }

    const spanScreening = material ? solidPolycarbonateSpanM(input.thicknessMm, input.designLoadKnM2, material) : null;

    return {
      input,
      recommendation,
      material,
      metrics,
      nesting: nest,
      dfmFindings: findings,
      thermalMovementMm: thermalMovement,
      spanScreening,
      weightKg: weight,
      costs,
      packaging,
      price,
      manualReasons,
      quoteNumber: `SPX-DEMO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-001`
    };
  }

  function formatMoney(value, currency = "CNY") {
    if (value === null || value === undefined || !Number.isFinite(value)) return "pending";
    return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return {
    num,
    positive,
    nonNegative,
    round,
    recommendMaterial,
    normalizeInput,
    defaultTemplateMetrics,
    thermalMovementMm,
    weightKg,
    nesting,
    solidPolycarbonateSpanM,
    dfmFindings,
    processCosts,
    packagingAndLogistics,
    calculateQuote,
    formatMoney
  };
});
