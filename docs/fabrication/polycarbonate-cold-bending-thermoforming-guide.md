# Polycarbonate Cold Bending & Thermoforming Engineering Guide

**Technical Domain:** Fabrication / Polymer Processing
**Reading Time:** 16 minutes
**Last Updated:** July 2026

---

## 1. Executive Summary

Polycarbonate is unique among transparent engineering thermoplastics in its ability to be cold-formed at room temperature without heating, cracking, or significant optical distortion — a property that enables curved architectural glazing, machine guards, and transportation applications without the capital cost of thermoforming ovens. However, cold bending has strict limits governed by thickness, temperature, and radius of curvature. Beyond those limits, thermoforming is required. This guide provides engineers with the physics, formulas, process controls, and defect-prevention strategies for both cold bending and thermoforming polycarbonate sheets.

---

## 2. Cold Bending — Physics and Limits

### 2.1 Why Polycarbonate Can Cold-Bend

Cold bending is possible because polycarbonate's elongation at yield is approximately 6% at 23°C — meaning a sheet can stretch 6% before permanent deformation begins. By comparison:
- PMMA (acrylic): 2–3% — cracks before visible bending
- PETG: 3–4% — marginal for architectural curves
- PVC: 10–15% — can cold-bend further but lacks UV stability

The practical consequence: polycarbonate bridges the gap between brittle acrylic (must thermoform) and flexible PVC (bends easily but degrades under UV), offering the best combination of transparency, UV resistance, and formability in a single material.

### 2.2 Minimum Cold Bend Radius Formula

The fundamental relationship per EN 16240:

```
R_min = t × (100 / ε_yield - 1) / 2

Where:
  R_min = Minimum centerline bend radius (mm)
  t      = Sheet thickness (mm)
  ε_yield = Elongation at yield (%)
```

For polycarbonate at 23°C (ε_yield = 6%):

```
R_min = t × (100 / 6 - 1) / 2 = t × (16.67 - 1) / 2 ≈ 7.8 × t

Simplified: R_min = 8 × thickness (room temperature, conservative)
```

### 2.3 Temperature-Dependent Minimum Radius

| Temperature | ε_yield (%) | R_min Multiplier | 6 mm Sheet R_min | 10 mm Sheet R_min |
|-------------|-------------|------------------|------------------|--------------------|
| −20°C | 4.0 | 12× t | 72 mm | 120 mm |
| 0°C | 5.0 | 9.5× t | 57 mm | 95 mm |
| +20°C | 6.0 | 8× t | 48 mm | 80 mm |
| +40°C | 7.5 | 6.2× t | 37 mm | 62 mm |
| +60°C | 9.0 | 5.1× t | 31 mm | 51 mm |

**Critical rule:** Never cold-bend polycarbonate below −20°C. The material transitions through its glass transition range and becomes brittle, failing by sudden fracture rather than ductile yielding. If winter installation is unavoidable, pre-warm sheets to +15°C minimum in a heated enclosure for 2 hours per 3 mm of thickness before forming.

### 2.4 Springback

Polycarbonate exhibits 5–8° of springback after cold bending — meaning a sheet bent to an apparent 90° angle will relax to approximately 82–85° after release. Springback is predictable and compensable:

```
θ_actual = θ_target + θ_springback

θ_springback ≈ 6° (independent of thickness for t ≥ 4 mm at room temperature)
```

**Compensation:** Over-bend by 6°. For 90° target, form to 96°; for 45° target, form to 51°.

Springback increases at lower temperatures (up to 10° at 0°C) and decreases at elevated temperatures (3° at 40°C). For critical architectural applications, run a test bend on a scrap piece from the same production lot to confirm springback before committing to full production.

---

## 3. Cold Bending Procedure

### 3.1 Multiwall vs Solid Sheets

| Property | Solid Cold-Bend | Multiwall Cold-Bend |
|----------|-----------------|---------------------|
| Minimum radius | 8 × thickness | 12 × thickness (rib collapse risk) |
| Direction constraint | None | Bend perpendicular to ribs only |
| Springback | 5–8° | 3–5° (rib structure absorbs some stress) |
| Optical quality | Maintains clarity | Slight rib distortion visible at close range |
| Maximum thickness for cold-bend | Up to 12 mm | Up to 16 mm (triple-wall) |

**Multiwall restriction:** Bending parallel to ribs causes rib buckling and delamination between skins. Always orient multiwall panels with ribs running vertically in curved installations (top-to-bottom bend direction, ribs perpendicular to the curve).

### 3.2 Step-by-Step Cold Bending

1. **Calculate R_min** using the formula or table above. If target radius is less than R_min, cold bending is not possible — switch to thermoforming.

2. **Build a bending jig** with the target radius + 6° over-bend compensation. Use plywood or MDF with smooth, splinter-free surface. Line contact surfaces with felt or soft rubber to prevent scratching.

3. **Condition the sheet** to ambient temperature for 24 hours before forming. Sheets taken directly from cold storage or outdoor pallets will have internal temperature gradients that cause asymmetric springback.

4. **Remove protective film from bend zone only** — leave film on flat areas to protect against tool marks. Use a sharp utility knife with a fresh blade to score the film at the bend boundaries.

5. **Apply force gradually** — over 10–30 seconds for the full bend cycle. Fast bending (under 2 seconds) induces localized stress concentrations that can cause micro-crazing visible under polarized light. Slower is always safer.

6. **Hold in jig for 3–5 minutes** at room temperature to allow stress relaxation. For thicknesses above 8 mm, extend hold time to 8-10 minutes.

7. **Check springback** after release. If >8°, re-jig with increased over-bend; if <3°, verify radius hasn't exceeded the target.

### 3.3 Cold Bending Defects

| Defect | Appearance | Root Cause | Prevention |
|--------|-----------|------------|------------|
| Stress whitening | Cloudy white band along bend line | Bend radius below R_min; too cold; bent too fast | Increase radius; pre-warm sheet; slow bend speed |
| Micro-crazing | Fine silver lines visible under polarized light | Localized over-stress from uneven force application | Use full-width bending brake, not point loads |
| Asymmetric curve | Radius varies across panel width | Uneven temperature across sheet; non-uniform force | Condition sheet 24h at uniform temp; check jig parallelism |
| Surface scratches | Visible lines on bend exterior | Film removed; dirty jig; metal-on-PC contact | Leave film on flat areas; line jig with felt |
| Delamination (multiwall) | Internal rib separation | Bend parallel to ribs; radius <12× t | Orient ribs perpendicular to curve; increase radius |

---

## 4. Thermoforming — Process and Parameters

### 4.1 When Thermoforming Is Required

Thermoforming is mandatory when:
- Target radius < R_min for cold bending
- Bend angle > 120° (wrap-around forms)
- Three-dimensional compound curves (domes, hemispheres)
- Multiwall panels requiring tight-radius forming
- Thicknesses above 12 mm requiring uniform heating through-section
- Production volumes above 50 units where a mold is economically justified

### 4.2 Pre-Drying — The Most Critical Step

Polycarbonate absorbs 0.15–0.35% moisture from ambient air within 24 hours of exposure. Heating moisture-laden polycarbonate above 100°C causes hydrolysis — water molecules react with polymer chains, creating bubbles, surface splay, and a 20–40% reduction in impact strength.

**Mandatory pre-drying schedule:**

| Sheet Thickness | Drying Temperature | Minimum Dry Time | Maximum Shelf Life After Drying |
|-----------------|-------------------|------------------|-------------------------------|
| 2–4 mm | 120°C | 2 hours | 30 minutes at ambient humidity |
| 5–8 mm | 120°C | 4 hours | 45 minutes |
| 9–12 mm | 120°C | 6 hours | 60 minutes |
| 13–16 mm (multiwall) | 115°C | 8 hours | 60 minutes |

Use a desiccant dryer with −40°C dew point minimum. Tray drying in a standard convection oven is acceptable for low-volume production if the oven is dedicated to PC only (no PVC cross-contamination — PVC degrades to HCl gas which attacks PC at 120°C).

**Moisture verification:** The "sizzle test" — press a heated metal rod (200°C) against the sheet surface. Bubbles or audible sizzling indicate residual moisture; return to dryer.

### 4.3 Heating Parameters

| Parameter | Value | Tolerance |
|-----------|-------|-----------|
| Sheet surface temperature (forming) | 170–190°C | ±5°C |
| Core temperature (exit oven) | 160–185°C | ±5°C |
| Heater type | Quartz IR (medium-wave, 2.5–3.5 μm) | — |
| Distance: heater to sheet | 150–250 mm | ±10 mm |
| Heating time (approximate) | 45–60 sec/mm thickness | ±20% depending on heater power |
| Maximum oven dwell temperature | 200°C | Do not exceed — thermal degradation begins |

**Temperature verification:** Use an IR thermometer (emissivity setting 0.95 for polycarbonate) to measure surface temperature at 5–7 points across the sheet immediately upon exit from the oven. Temperature difference across the sheet must not exceed 10°C — uneven heating causes asymmetric forming, wall thickness variation, and built-in stress.

### 4.4 Mold Design

| Element | Specification |
|---------|--------------|
| Mold material | Aluminum 6061-T6 (high-volume) or epoxy tooling board (low-volume, <500 cycles) |
| Mold temperature | 80–100°C (heated mold) — improves surface finish and reduces internal stress |
| Draft angle | 3° minimum (5° recommended for textured surfaces) |
| Corner radii | ≥ sheet thickness (to prevent thinning and stress concentration) |
| Surface finish | 0.8 μm Ra or finer (coarser mold finish transfers directly to formed part) |
| Vacuum hole diameter | 0.5–0.8 mm for matte surfaces; 0.3–0.5 mm for high-gloss |
| Vacuum hole spacing | 25–40 mm center-to-center |

### 4.5 Forming Sequence

1. **Pre-dry** sheet per schedule above
2. **Load sheet** into clamping frame — pneumatic clamps with silicone pads recommended
3. **Heat** — monitor surface temperature with IR thermometer; target 180°C uniform
4. **Transfer** to mold station — maximum transfer time: 3 seconds (sheet cools ~2°C/sec in ambient air)
5. **Form** — vacuum applied at 600–700 mbar (absolute pressure 300–400 mbar). Hold 30–60 seconds until part temperature drops below Tg (147°C)
6. **Cool** on mold — forced air cooling at 2–3 m/s until surface temperature <80°C (approximately 1–2 minutes for 6 mm sheet)
7. **Demold** — release vacuum, apply gentle compressed air pulse to break seal if necessary
8. **Anneal** (optional but recommended for critical parts): 120°C for 1 hour per 3 mm of thickness, then cool at ≤20°C/hour to room temperature

---

## 5. Thermoforming Defects and Solutions

| Defect | Cause | Solution |
|--------|-------|----------|
| Bubbles (internal) | Insufficient drying; moisture >0.02% | Increase dry time; verify dryer dew point |
| Surface splay (silver streaks) | Moisture at sheet surface; overheated surface | Reduce heater temperature or increase distance |
| Wall thinning >50% | Sheet sag before forming; insufficient vacuum | Add plug assist; pre-stretch sheet with air pressure |
| Webbing (wrinkles at corners) | Excess material in corner zones; poor mold design | Add corner dams; increase draw ratio progressively |
| Warpage (post-molding) | Uneven cooling; residual stress | Anneal after forming; ensure symmetrical mold cooling |
| Surface marks (mold transfer) | Rough mold surface; sheet sticking | Polish mold to Ra <0.8 μm; apply mold release (silicone-free) |
| Yellowing | Overheating (>200°C); excessive oven dwell | Reduce temperature; verify oven temperature uniformity |

---

## 6. Post-Forming Operations

### 6.1 CNC Trimming

Thermoformed parts require trimming to remove the clamp frame flange and cut openings. Use single-flute upcut router bits at 18,000–24,000 RPM with feed rates of 1,500–3,000 mm/min. Cool with compressed air — never use flood coolant, as water-based coolants can cause stress cracking in the heat-affected zone.

For large parts (above 1 m²), use a vacuum table with the formed part nested into a custom fixture. Reference off the mold surface, not the trimmed flange, to maintain dimensional accuracy.

### 6.2 Drilling and Fastening

Drill oversized holes (Ø = screw shank + 2 mm minimum) to allow differential thermal expansion between the polycarbonate part and its metal frame. Use EPDM or silicone washers under all fasteners. Torque-limit to 2.5 N·m for M5 and 3.5 N·m for M6 — overtightening is the single most common cause of post-installation cracking in formed PC parts.

### 6.3 Hard-Coating After Forming

Thermoforming degrades factory-applied hard coats — the coating stretches and thins non-uniformly, creating weak spots. For applications requiring abrasion resistance (machine guards, architectural glazing), specify post-forming dip or flow coating:

1. Clean formed part with isopropyl alcohol — allow 5 minutes to evaporate fully
2. Apply polysiloxane hard coat via flow coat or dip at controlled withdrawal rate (100–200 mm/min)
3. Cure at 120°C for 30–45 minutes in dust-free oven
4. Resulting coating thickness: 4–8 μm (versus 8–12 μm on factory-coated flat sheet)

For standard polycarbonate products with factory hard coat, see [Anti-Scratch Hard-Coated PC Sheets](https://polycarbonate.cc/product/anti-scratch-hard-coated-pc/).

---

## 7. Cold Bending vs Thermoforming — Decision Matrix

| Criterion | Cold Bending | Thermoforming |
|-----------|-------------|---------------|
| Setup cost | $50–500 (jig only) | $2,000–50,000 (mold + oven) |
| Per-part cost (100 units) | $5–15 | $15–40 |
| Minimum radius | 8 × thickness | 1 × thickness (with plug assist) |
| 3D compound curves | No | Yes |
| Production rate | 2–5 parts/hour (manual) | 20–60 parts/hour |
| Thickness limit | ~12 mm solid | ~16 mm |
| Material waste | Near zero | 15–25% (trimmed flange) |
| Optical quality (clear) | Excellent (if within R_min) | Good (slight mold marks possible) |
| Part consistency | ±3° angle tolerance | ±1° angle tolerance |
| Suitable for multiwall | Yes (perpendicular to ribs only) | Yes (but requires careful temperature control to avoid rib collapse) |

---

## 8. Case Study: Curved Machine Guard

**Application:** CNC turning center enclosure, 180° wrap-around guard
**Material:** 8 mm solid polycarbonate, clear, UV-coated
**Production volume:** 500 units/year

**Decision:** Thermoforming selected because:
- 180° wrap exceeds cold-bend limit for 8 mm (maximum ~130° per bend with intermediate flat sections)
- Production volume (500/year) justifies mold cost
- Part consistency (±1°) required for repeatable installation across machine variants

**Mold:** Aluminum 6061-T6, heated to 90°C, vacuum-formed with temperature-controlled IR oven at 180°C sheet surface temperature.

**Results:**
- Cycle time: 4.5 minutes per part (versus estimated 12 minutes for cold-bend manual jig)
- Scrap rate: 1.2% (primarily from moisture-related bubbles in 3 of ~250 parts — traced to dryer maintenance interval)
- Part cost: $28 (versus $15 estimated for cold-bend, but at half the labor)
- 3-year field failure rate: 0.4% (2/500 units — both traced to installer overtightening, not forming defects)

**Lesson learned:** At 500 units/year, the thermoforming mold broke even against cold-bend jig at month 8, and delivered net savings of $12,700 in year 2 due to reduced labor and scrap. Above 100 units, always run the thermoforming ROI calculation before defaulting to cold-bend.

---

## 9. Safety

### 9.1 Cold Bending
- Polycarbonate under stress stores elastic energy. Large sheets (above 2 m²) released suddenly can cause impact injury. Always secure both ends of the sheet before releasing any clamp.
- Protective gloves required — sheet edges are sharp after cutting. Deburr all edges with 120-grit sandpaper or a deburring tool before handling.

### 9.2 Thermoforming
- Oven exit temperature of 180°C causes second-degree burns on contact. Heat-resistant gloves (rated to 250°C) mandatory.
- Polycarbonate thermal degradation products (above 300°C) include bisphenol-A vapor and carbon monoxide. Ensure adequate ventilation (minimum 6 air changes per hour). If smoke is visible from the oven, the temperature setpoint is too high or a sheet has been left in dwell too long.
- Pre-drying oven must be explosion-proof rated if solvents are used anywhere in the facility — desiccant dust plus solvent vapor is a combustible mixture.

---

## 10. Frequently Asked Questions

**Q: Can I cold-bend polycarbonate on-site during winter installation?**
Only if the sheet temperature is above 0°C. At 0°C, R_min increases to 9.5× thickness (versus 8× at room temperature), and springback increases to ~10°. For reliable on-site cold bending in cold weather, pre-warm sheets in a heated enclosure to +15°C minimum for 2 hours per 3 mm of thickness before forming. Field reports from Canadian greenhouse installers confirm that attempting cold bends at −10°C results in >30% stress-whitening failure rate.

**Q: Does cold bending weaken polycarbonate over time?**
No — provided the bend radius stays above R_min. Polycarbonate's stress relaxation mechanism dissipates internal stress over 24–48 hours at room temperature. A properly cold-bent sheet retains full impact strength and optical clarity for the service life of the material. Stress whitening indicates the radius was below R_min, and that panel should not be used in service.

**Q: Can multiwall polycarbonate be thermoformed?**
Yes, with restrictions. The rib structure acts as an insulator, so through-thickness heating must be slower and more uniform than for solid sheet. Use upper and lower IR heaters at reduced power (60–70% of solid sheet setting) to prevent the outer skins from overheating before the internal ribs reach forming temperature. Form with lower vacuum (400–500 mbar) to prevent rib collapse. Maximum recommended thickness for thermoformed multiwall is 16 mm triple-wall.

**Q: What's the difference between thermoforming and drape forming?**
Thermoforming uses vacuum to pull the sheet against a mold surface. Drape forming (also called free forming) uses a male mold over which the heated sheet is draped by gravity and manual manipulation — no vacuum. Drape forming produces lower-tolerance parts but requires only a simple male plug mold, reducing tooling cost by 60–80%. Use drape forming for prototypes, architectural features where ±5 mm tolerance is acceptable, and production runs under 20 units.

---

## 11. References

1. EN 16240:2014 — Light transmitting flat solid polycarbonate sheets for internal and external use in roofs, walls and ceilings
2. ISO 527-2:2012 — Plastics — Determination of tensile properties
3. Throne, J.L. (2008). *Understanding Thermoforming*, 2nd Ed. Hanser Publications.
4. Bayer MaterialScience (2015). *Thermoforming of Makrolon Polycarbonate Sheets — Processing Guide*.
5. Brydson, J.A. (1999). *Plastics Materials*, 7th Ed. Butterworth-Heinemann.

---

## About Bakway Advanced Material Co., Ltd.

Bakway Advanced Material Co., Ltd. is an IATF 16949 certified polycarbonate sheet manufacturer with 40,000 m² of production capacity in Suzhou, China. The company's [solid polycarbonate sheets](https://polycarbonate.cc/product/solid-pc-sheets/) are suitable for cold bending and thermoforming applications. For detailed manufacturing specifications and quality certifications, see [Bakway's manufacturing technology](https://polycarbonate.cc/polycarbonate-manufacturing-technology/).
