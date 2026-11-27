(function (root) {
  const config = {
    meta: {
      schemaVersion: "0.1.0-demo",
      currency: "CNY",
      ratesArePlaceholder: true,
      company: "Suzhou Sinoplastix Technology Co., Ltd.",
      brand: "SinoPlastix",
      website: "https://sinoplastix.com",
      email: "sales@sinoplastix.com"
    },
    sheetSizes: [
      { id: "1220x2440", widthMm: 1220, lengthMm: 2440, usableWidthMm: 1200, usableLengthMm: 2420, kerfMm: 3 },
      { id: "2050x3050", widthMm: 2050, lengthMm: 3050, usableWidthMm: 2030, usableLengthMm: 3030, kerfMm: 3 }
    ],
    materials: [
      {
        id: "pc-solid",
        name: "Solid polycarbonate sheet",
        polymer: "PC",
        structure: "solid",
        densityKgM3: 1200,
        thermalExpansionMmMk: 0.065,
        thicknessesMm: [3, 4, 5, 6, 8, 10],
        pricePerM2: 118,
        bendFactor: 150,
        applications: ["machine-guarding", "glazing-facade", "sound-barrier", "fabrication-part", "interior-partition"],
        note: "High impact resistance and transparency; final grade and evidence must be confirmed."
      },
      {
        id: "pc-multiwall",
        name: "Multiwall polycarbonate sheet",
        polymer: "PC",
        structure: "multiwall",
        densityKgM3: null,
        thermalExpansionMmMk: 0.065,
        thicknessesMm: [4, 6, 8, 10, 16, 20],
        weightsKgM2: { "4": 0.8, "6": 1.0, "8": 1.3, "10": 1.5, "16": 1.7, "20": 2.1 },
        pricePerM2: 72,
        bendFactor: null,
        applications: ["roofing-canopy", "greenhouse", "glazing-facade"],
        note: "Thermal insulation and low weight; section properties require manufacturer-validated geometry."
      },
      {
        id: "pmma-cast",
        name: "Cast acrylic sheet",
        polymer: "PMMA",
        structure: "solid",
        densityKgM3: 1190,
        thermalExpansionMmMk: 0.07,
        thicknessesMm: [2, 3, 4, 5, 6, 8, 10, 12],
        pricePerM2: 96,
        bendFactor: 180,
        applications: ["display-retail", "splashback", "lighting-signage", "interior-partition", "sound-barrier", "fabrication-part"],
        note: "High optical quality; more brittle than polycarbonate in impact applications."
      },
      {
        id: "pmma-extruded",
        name: "Extruded acrylic sheet",
        polymer: "PMMA",
        structure: "solid",
        densityKgM3: 1190,
        thermalExpansionMmMk: 0.07,
        thicknessesMm: [2, 3, 4, 5, 6],
        pricePerM2: 78,
        bendFactor: 160,
        applications: ["display-retail", "lighting-signage", "interior-partition", "fabrication-part"],
        note: "Cost-effective acrylic route for flatter, less demanding fabricated parts."
      },
      {
        id: "petg",
        name: "PETG sheet",
        polymer: "PETG",
        structure: "solid",
        densityKgM3: 1270,
        thermalExpansionMmMk: 0.068,
        thicknessesMm: [1, 2, 3, 4, 5, 6],
        pricePerM2: 88,
        bendFactor: 100,
        applications: ["display-retail", "fabrication-part", "lighting-signage"],
        note: "Formable transparent sheet; chemical and heat resistance must be checked per application."
      }
    ],
    applicationGuidance: {
      "machine-guarding": { material: "pc-solid", thicknessMm: 5, title: "Machine guarding", summary: "Prioritize impact resistance and visibility; confirm applicable safety standard and mounting details." },
      greenhouse: { material: "pc-multiwall", thicknessMm: 8, title: "Greenhouse", summary: "Prioritize light transmission, insulation, condensation behavior, UV orientation and frame spacing." },
      "roofing-canopy": { material: "pc-multiwall", thicknessMm: 10, title: "Roofing / canopy", summary: "Start with multiwall PC and confirm wind/snow load, support spacing, slope, drainage and fixing system." },
      "display-retail": { material: "pmma-cast", thicknessMm: 4, title: "Display / retail", summary: "Prioritize optical quality and appearance; use PC when impact resistance is essential." },
      "lighting-signage": { material: "pmma-extruded", thicknessMm: 3, title: "Lighting / signage", summary: "Prioritize diffusion, surface quality and forming requirements; validate with the actual LED source." },
      splashback: { material: "pmma-cast", thicknessMm: 4, title: "Acrylic splashback", summary: "Confirm heat clearance, wall substrate, adhesive compatibility and cutout dimensions." },
      "sound-barrier": { material: "pc-solid", thicknessMm: 8, title: "Sound barrier", summary: "Choose PC for impact/vandal resistance or cast acrylic for optical quality after system review." },
      "energy-storage": { material: "pc-solid", thicknessMm: 4, title: "Energy-storage insulation", summary: "Select functional PC grade only after flame, insulation, ESD and temperature requirements are explicit." },
      "fabrication-part": { material: "pc-solid", thicknessMm: 5, title: "Fabricated part", summary: "Select material from impact, optical, tolerance, forming and fabrication requirements." },
      "interior-partition": { material: "pmma-cast", thicknessMm: 5, title: "Interior partition", summary: "Prioritize privacy, surface quality, cleaning and impact exposure." }
    },
    processRates: {
      cutting: { ratePerM: 7.5, setupFee: 80, minimumCharge: 60 },
      drilling: { ratePerHole: 2.2, setupFee: 40, minimumCharge: 30 },
      bending: { ratePerBend: 18, setupFee: 120, minimumCharge: 80 },
      polishing: { ratePerM: 11, setupFee: 60, minimumCharge: 40 },
      coating: { ratePerM2: 32, setupFee: 180, minimumCharge: 100 }
    },
    commercial: {
      packagingBaseFee: 90,
      packagingRatePerCbm: 160,
      seaReferenceRatePerCbm: 520,
      overheadPct: 0.12,
      marginPct: 0.18,
      manualRangeDownPct: 0.12,
      manualRangeUpPct: 0.25,
      packingFactor: 1.25
    },
    dfm: {
      minHoleEdgeToThicknessFactor: 2,
      minHoleDiameterToThicknessFactor: 1.5,
      denseHoleAreaM2PerHole: 0.05,
      minInternalCornerRadiusMm: 1,
      tightToleranceMm: 0.5
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = config;
  root.CpqDemoConfig = config;
})(typeof self !== "undefined" ? self : globalThis);
