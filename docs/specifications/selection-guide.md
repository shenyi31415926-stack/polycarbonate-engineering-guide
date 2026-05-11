# Polycarbonate Sheet Selection Guide: Technical Specifications vs. Application Requirements

**Published:** May 2026  
**Reading Time:** 12 minutes  
**Technical Difficulty:** Intermediate  

---

## Executive Summary

Selecting the appropriate polycarbonate sheet configuration requires systematic evaluation of load-bearing requirements, thermal performance targets, optical specifications, and environmental exposure conditions. This guide provides engineers with data-driven selection criteria based on standardized testing methods and field performance data.

---

## 1. Material Type Comparison

### 1.1 Solid (Monolithic) Polycarbonate Sheets

| Property | Test Method | Value | Unit |
|----------|-------------|-------|------|
| Density | ISO 1183 | 1.20 | g/cm³ |
| Tensile Strength | ISO 527 | 65 | MPa |
| Flexural Modulus | ISO 178 | 2,300 | MPa |
| Impact Strength (Charpy) | ISO 179 | 250 | kJ/m² |
| Light Transmission | ASTM D1003 | 90 | % |
| UV Cutoff | Internal | 380 | nm |

**Applications:**
- Machine guards requiring high impact resistance
- Acoustic barriers where sound transmission loss is critical
- Safety glazing for architectural features
- Optical applications requiring maximum clarity

### 1.2 Multiwall (Cellular) Polycarbonate Sheets

#### Twin-Wall Configuration

| Property | 4mm | 6mm | 8mm | 10mm |
|----------|-----|-----|-----|------|
| Weight (kg/m²) | 0.8 | 1.0 | 1.3 | 1.5 |
| U-Value (W/m²K) | 3.5 | 2.8 | 2.6 | 2.4 |
| Light Transmission (%) | 82 | 80 | 78 | 76 |
| Sound Reduction (dB) | 15 | 17 | 19 | 21 |
| Max Span (m) | 0.6 | 0.9 | 1.1 | 1.3 |

#### Triple-Wall Configuration

| Property | 10mm | 16mm | 20mm |
|----------|------|------|------|
| Weight (kg/m²) | 1.2 | 1.7 | 2.1 |
| U-Value (W/m²K) | 2.1 | 1.8 | 1.6 |
| Light Transmission (%) | 74 | 70 | 66 |
| Max Span (m) | 1.5 | 2.0 | 2.4 |

**Applications:**
- Greenhouse roofing requiring thermal insulation
- Industrial skylights with snow load considerations
- Covered walkways with condensation control needs
- Swimming pool enclosures with humidity management

### 1.3 Corrugated Polycarbonate Sheets

| Profile | Pitch (mm) | Height (mm) | Coverage Width (mm) |
|---------|------------|-------------|---------------------|
| Round Wave | 76 | 18 | 1040 |
| Trapezoidal (Greca) | 76 | 16 | 1060 |
| Industrial | 130 | 30 | 1000 |

**Applications:**
- Industrial roofing with metal purlin systems
- Agricultural buildings requiring natural ventilation
- Temporary structures with cost constraints

---

## 2. Selection Decision Matrix

### 2.1 Thermal Performance Priority

When U-value (thermal transmittance) is the primary design driver:

```
Required U-Value ≤ 2.0 W/m²K:
→ Triple-wall 16mm or greater
→ Solid sheet with insulated backing

Required U-Value 2.0-3.0 W/m²K:
→ Twin-wall 8-10mm
→ Triple-wall 10mm

Required U-Value > 3.0 W/m²K:
→ Twin-wall 4-6mm
→ Solid sheet (if thermal performance secondary)
```

### 2.2 Structural Load Calculations

#### Snow Load Example Calculation

**Project Location:** Northern Europe (Design snow load: 1.5 kN/m²)
**Span:** 1.2m between supports

For twin-wall 10mm polycarbonate:
- Maximum allowable load: 1.8 kN/m² (manufacturer data, safety factor 1.5 applied)
- Design load: 1.5 kN/m²
- **Result:** ✅ Suitable with 20% safety margin

**Formula:**
```
Required Thickness = (Design Load × Span²) / (8 × Allowable Stress)

Where:
- Allowable Stress = 12 MPa (polycarbonate flexural, with safety factor)
- Span in meters
- Result in mm
```

#### Wind Load Example Calculation

**Project Location:** Coastal area (Design wind pressure: 1.2 kN/m²)
**Panel Size:** 1.0m × 2.0m

Maximum bending moment:
```
M_max = (Wind Pressure × Width × Length²) / 8
M_max = (1.2 × 1.0 × 2.0²) / 8 = 0.6 kN·m/m
```

Required section modulus:
```
Z_req = M_max / Allowable Stress
Z_req = 600 N·m/m / 12,000,000 Pa = 0.00005 m³/m = 50,000 mm³/m
```

**Result:** Twin-wall 8mm provides Z = 65,000 mm³/m ✅ Suitable

### 2.3 Optical Performance Requirements

| Application | Min. Light Transmission | Recommended Type |
|-------------|------------------------|------------------|
| Photography studios | 90% | Solid, UV-coated |
| Plant propagation | 85-90% | Twin-wall 4-6mm |
| Commercial greenhouses | 75-85% | Twin-wall 8-10mm |
| Privacy screens | 40-60% | Solid, tinted |
| Display cases | 90%+ | Solid, anti-reflective |

---

## 3. Environmental Considerations

### 3.1 UV Resistance Grades

| Grade | UV Coating | Expected Lifespan | Application |
|-------|-----------|-------------------|-------------|
| Standard | One-sided, 30μm | 5-7 years | Temporary structures |
| Extended | One-sided, 50μm | 10 years | General construction |
| Premium | Both-sided, 50μm | 15+ years | Permanent installations |
| Architectural | Both-sided, 80μm | 20+ years | High-end applications |

### 3.2 Temperature Performance

| Property | Value | Notes |
|----------|-------|-------|
| Continuous Service Temperature | -40°C to +120°C | Long-term exposure |
| Short-term Maximum | +130°C | ≤1 hour duration |
| Cold Bend Radius (min) | 150 × thickness | At +20°C |
| Cold Bend Radius (min) | 300 × thickness | At -20°C |

### 3.3 Chemical Resistance

**Compatible:**
- Mild detergents and soaps
- Isopropyl alcohol (cleaning)
- Most agricultural chemicals (when dry)

**Avoid:**
- Ketones (acetone, MEK)
- Chlorinated hydrocarbons
- Aromatic solvents (toluene, xylene)
- Strong bases (concentrated ammonia)

---

## 4. Cost-Benefit Analysis

### 4.1 Initial Cost Comparison (per m², USD)

| Type | Thickness | Material Cost | Installation Cost | Total |
|------|-----------|---------------|-------------------|-------|
| Solid | 3mm | $12-15 | $8-10 | $20-25 |
| Solid | 6mm | $18-22 | $8-10 | $26-32 |
| Twin-wall | 6mm | $14-18 | $10-12 | $24-30 |
| Twin-wall | 10mm | $22-28 | $10-12 | $32-40 |
| Triple-wall | 16mm | $35-45 | $12-15 | $47-60 |

### 4.2 Life-Cycle Cost Analysis (20 years)

**Scenario:** Greenhouse roofing, 1000 m²

| Factor | Twin-wall 8mm | Triple-wall 16mm |
|--------|---------------|------------------|
| Initial Cost | $35,000 | $55,000 |
| Annual Heating Savings* | $800 | $1,400 |
| 20-Year Energy Savings | $16,000 | $28,000 |
| **Net 20-Year Cost** | **$19,000** | **$27,000** |

*Based on heating cost $0.12/kWh, 2000 degree-days/year

**Result:** Triple-wall costs 42% more initially but provides superior long-term value in heating-dominated climates.

---

## 5. Selection Checklist

Before finalizing polycarbonate sheet specification:

- [ ] Structural loads calculated (wind, snow, live loads)
- [ ] Thermal requirements defined (U-value targets)
- [ ] Optical performance specified (transmission, diffusion)
- [ ] Environmental exposure assessed (UV, temperature, chemicals)
- [ ] Support structure designed for expansion/contraction
- [ ] Installation details reviewed with contractor
- [ ] Warranty requirements understood (typically 10 years)
- [ ] Local building code compliance verified

---

## 6. Common Selection Mistakes

### ❌ Underspecifying Thickness
**Mistake:** Using 6mm twin-wall for 1.5m spans  
**Consequence:** Excessive deflection, potential failure under snow load  
**Solution:** Minimum 10mm for spans >1.2m

### ❌ Ignoring Expansion Gaps
**Mistake:** Rigid fastening without thermal expansion accommodation  
**Consequence:** Buckling, stress cracking at fasteners  
**Solution:** 3mm expansion gap per meter of length at +20°C installation

### ❌ UV Coating Orientation
**Mistake:** Installing UV-coated side facing interior  
**Consequence:** Rapid surface degradation, yellowing  
**Solution:** UV coating must face sun (typically exterior for roofing)

### ❌ Inadequate Framing
**Mistake:** Using wood framing without thermal break  
**Consequence:** Condensation, thermal bridging, water damage  
**Solution:** Use thermally broken aluminum or PVC extrusions

---

## 7. Frequently Asked Questions

**Q: Can polycarbonate sheets be used for load-bearing applications?**  
A: No, polycarbonate is not structural. It must be supported by framing at calculated intervals. It can bear incidental loads (snow, wind) but not primary structural loads.

**Q: How do I clean polycarbonate without scratching?**  
A: Use lukewarm water with mild dish soap and a soft microfiber cloth. Rinse thoroughly. Never use abrasive cleaners, brushes, or solvents.

**Q: What's the maximum size available?**  
A: Standard widths: 1220mm, 2100mm (solid); 980mm, 1050mm (multiwall). Standard lengths up to 11.8m. Custom sizes available with minimum order quantities.

**Q: Can polycarbonate be recycled?**  
A: Yes, polycarbonate is recyclable (resin code 7). However, UV coatings must be removed before recycling. Many manufacturers offer take-back programs for end-of-life materials.

---

## References

1. ISO 527-2:2012 - Plastics — Determination of tensile properties
2. ISO 178:2019 - Plastics — Determination of flexural properties
3. ASTM D1003-21 - Standard Test Method for Haze and Luminous Transmittance
4. EN 1453:2015 - Plastics piping systems for soil and waste discharge
5. Bakway Advanced Material Technical Datasheets (2025)

---

## About This Guide

This technical guide is maintained by [Bakway Advanced Material](https://www.polycarbonate.cc), an IATF 16949 certified manufacturer specializing in polycarbonate sheets for industrial, agricultural, and architectural applications.

For project-specific engineering support, contact: engineering@polycarbonate.cc

---

**Document Version:** 1.0  
**Last Updated:** May 2026
