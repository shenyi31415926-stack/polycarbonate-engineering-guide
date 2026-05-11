# CNC Machining Polycarbonate: Complete Guide to Routing, Cutting, and Finishing

**Technical Guide** | Fabrication Engineering | May 2026  
**Author:** James Wilson, Senior Fabrication Engineer at Bakway Advanced Material | 20+ Years Precision Machining Experience  
**Reading Time:** 16 minutes | **Technical Difficulty:** Intermediate to Advanced  
**Last Updated:** May 2026

---

## Executive Summary

CNC (Computer Numerical Control) machining represents the most versatile fabrication method for polycarbonate sheets, offering precision tolerances to ±0.05mm and supporting complex geometries impossible with cold forming or standard cutting. This comprehensive guide presents field-tested parameters, tooling recommendations, and quality control protocols developed from 15 years of Bakway's CNC processing operations across 40,000㎡ of fabrication facilities.

Based on our processing data from 50,000+ CNC jobs annually, proper machining parameters can achieve cutting speeds 40% faster than standard settings while maintaining edge quality and preventing stress cracking. For high-volume production, optimized CNC workflows reduce per-part processing costs by 25-35% compared to manual fabrication methods.

> **Critical Safety Note:** Laser cutting is **NOT suitable for polycarbonate** and will produce poor edge quality, yellowing, and toxic fumes. Laser cutting works for acrylic (PMMA) but should never be used for PC. For thermal cutting of polycarbonate, only [CNC routing with mechanical cutters](https://polycarbonate.cc/cnc-routingmachining-cnc/) or specialized knife-cutting systems are recommended.

---

## 1. CNC Machining Fundamentals for Polycarbonate

### 1.1 Material Behavior During Machining

Polycarbonate exhibits unique properties that distinguish it from other thermoplastics during CNC processing:

**Thermal Sensitivity:**
PC has a relatively low thermal conductivity (0.19 W/m·K) compared to metals, causing heat buildup at the cutting interface. Without proper chip evacuation and cooling, localized temperatures can exceed 150°C, causing:
- Surface gumming (material adhesion to tool)
- Stress cracking (micro-fractures from thermal shock)
- Dimensional instability (thermal expansion during cutting)

**Chip Formation Characteristics:**

In our tool wear studies at Bakway's Suzhou facility, we documented three distinct chip types based on cutting parameters:

| Chip Type | Appearance | Cause | Solution |
|-----------|-----------|-------|----------|
| **Continuous ribbon** | Long, unbroken strands | Excessive heat, low feed rate | Increase feed 20%, improve chip evacuation |
| **Powder/fine dust** | Granular debris | Dull tool, excessive speed | Reduce RPM 30%, replace tool |
| **Proper segmented** | Small curls, 10-20mm | Optimal parameters | Maintain current settings |

**Critical Finding:** Proper chip formation is the primary indicator of machining health. Continuous ribbons indicate heat buildup that will eventually cause tool failure and poor edge quality.

### 1.2 CNC Process Capabilities

[Bakway's CNC fabrication services](https://polycarbonate.cc/cnc-routingmachining-cnc/) support a comprehensive range of operations:

| Operation | Tolerance | Best Applications | Surface Finish |
|-----------|-----------|-------------------|----------------|
| **CNC Routing** | ±0.10mm | Perimeter cutting, profiling | Good, requires secondary finishing |
| **CNC Milling** | ±0.05mm | 3D contours, pockets, ribs | Excellent with proper tooling |
| **Drilling** | ±0.08mm | Through-holes, countersinks | Clean with peck cycle |
| **Counterboring** | ±0.10mm | Bolt heads, flush mounting | Excellent |
| **Threading** | Class 2B | M3-M12 threads | Good with formed threads |
| **Engraving** | ±0.05mm | Labeling, branding | Excellent |

**Material Thickness Range:**
Our facility processes PC sheets from 0.5mm films up to 50mm solid blocks. However, different thicknesses require distinct approaches:

- **Thin gauge (0.5-3mm):** Requires vacuum hold-down and reduced cutting forces to prevent vibration
- **Standard (3-12mm):** Optimal range for most CNC operations
- **Heavy gauge (12-25mm):** Requires specialized tooling and slower feed rates
- **Thick blocks (25-50mm):** Limited to routing and drilling; milling requires custom fixturing

---

## 2. Tooling Selection and Optimization

### 2.1 Router Bit Selection Guide

**Tool Material Comparison:**

Based on Bakway's tool life database (tracking 10,000+ tool changes annually):

| Tool Material | Best For | Tool Life (meters) | Cost per Meter | Recommendation |
|--------------|----------|-------------------|----------------|----------------|
| **HSS** | Prototyping, soft PC | 800-1,200m | $0.08/m | Only for short runs |
| **Carbide-tipped** | High-volume production | 3,000-5,000m | $0.03/m | **Best value** |
| **Solid carbide** | Precision work, hard PC | 5,000-8,000m | $0.05/m | Premium applications |
| **Diamond-coated** | Abrasive filled PC | 10,000m+ | $0.02/m | Special applications |

**Geometry Specifications:**

For [multiwall PC sheets](https://polycarbonate.cc/product/multiwall-pc-sheets/), use these specific geometries:

| Parameter | Standard PC | Multiwall PC | Thick Solid PC |
|-----------|-------------|--------------|----------------|
| **Helix angle** | 25-30° | 15-20° (reduced lift) | 30-35° |
| **Rake angle** | 5-8° | 3-5° | 8-12° |
| **Clearance angle** | 10-12° | 12-15° | 8-10° |
| **Number of flutes** | 2-3 | 1-2 (reduced heat) | 3-4 |

**Why Multiwall Requires Special Geometry:**
The rib structure in multiwall sheets creates interrupted cuts that generate vibration. Lower helix angles reduce upward pulling forces that can delaminate the rib-to-face bonds. We documented 40% reduction in sheet damage using 15° helix tools versus standard 30° tools on 10mm twin-wall PC.

### 2.2 Cutting Parameters by Thickness

**Optimal Speed and Feed (Bakway Standard Parameters):**

| Thickness | Tool Diameter | Spindle RPM | Feed Rate | Plunge Rate | Pass Depth |
|-----------|--------------|-------------|-----------|-------------|------------|
| **1-3mm** | 3-6mm | 18,000-24,000 | 2,500-3,500 | 800 | Full depth |
| **4-6mm** | 6-10mm | 14,000-18,000 | 2,000-2,800 | 600 | Full depth |
| **8-10mm** | 8-12mm | 12,000-16,000 | 1,500-2,200 | 500 | Full depth |
| **12-20mm** | 10-16mm | 10,000-14,000 | 1,000-1,500 | 400 | 2-3 passes |
| **20-30mm** | 12-20mm | 8,000-12,000 | 600-1,000 | 300 | 3-4 passes |

**Critical Parameter: Chip Load**

Chip load (feed per tooth) should be maintained at 0.05-0.15mm for polycarbonate:

```
Chip Load (mm) = Feed Rate (mm/min) / (RPM × Number of Flutes)

Example for 6mm tool:
- RPM: 18,000
- Feed: 2,700 mm/min
- Flutes: 2
- Chip Load: 2,700 / (18,000 × 2) = 0.075mm ✅ Optimal
```

**Real-World Production Data:**

From our high-volume medical device component production (batch sizes 5,000+ units):
- **Standard parameters:** 4.2 minutes/part, 8% rejection rate
- **Optimized parameters:** 2.8 minutes/part, 2% rejection rate
- **Key change:** Reduced RPM 15%, increased feed 20%, improved chip evacuation with compressed air

---

## 3. Advanced Machining Techniques

### 3.1 Multiwall PC Processing Protocol

**The Challenge:**
Multiwall sheets (twin-wall, triple-wall) require special handling because:
1. Rib structures create interrupted cuts
2. Top and bottom faces are thin (0.8-1.2mm each)
3. Internal chambers can collapse under excessive force

**Bakway's Proven Multiwall Protocol:**

**Step 1: Tool Selection**
- Use single-flute or two-flute O-flute router bits
- Diameter: 6-10mm for most applications
- No chipbreaker geometry (reduced tearing)

**Step 2: Fixturing**
- Vacuum table with felt垫 to distribute pressure
- Support within 100mm of cutting line
- Never clamp directly on thin faces (crushes chambers)

**Step 3: Cutting Sequence**
1. **Score cut:** 0.3mm deep at full speed to establish edge
2. **Finish cut:** Full depth at 70% of normal feed rate
3. **Tab strategy:** Leave 2mm tabs every 200mm to prevent part movement, then hand-trim

**Step 4: Quality Check**
- Inspect rib integrity with backlight (no shadows = good bond)
- Edge quality: Should be smooth, no delamination

**Case Study: Greenhouse Panel Production**

A 2024 project for a Dutch agricultural equipment manufacturer required 2,000 identical 980×1000mm panels with complex cutouts for ventilation:

- **Material:** 10mm twin-wall PC
- **Challenge:** Previous supplier had 15% rejection rate due to rib delamination
- **Bakway solution:**
  - Custom 15° helix single-flute tools
  - Vacuum fixture with 5-zone control
  - Tab-and-trim strategy
  - Compressed air chip evacuation
- **Result:** 1.2% rejection rate, 35% faster cycle time

### 3.2 Thick Solid PC (20-50mm) Machining

**Application:** Machine guards, ballistic panels, underwater viewing ports

**Critical Considerations:**

1. **Heat Management:**
   - Use flood coolant or mist system (not compressed air)
   - Maximum pass depth: 6-8mm per pass
   - Allow 30-second cooling between passes

2. **Tool Strategy:**
   - Roughing: High-feed mill, 6mm stepover
   - Finishing: Ball-end mill for contours
   - Drilling: Peck cycle with 3mm retract

3. **Stress Relief:**
   - [Annealing after machining](https://polycarbonate.cc/plastic-bending-gluing/) is mandatory for thick sections
   - Heat to 120°C for 2 hours, slow cool (20°C/hour)
   - Prevents delayed cracking from residual stresses

**Parameter Table for Thick PC:**

| Operation | Tool Type | RPM | Feed | Coolant | Pass Depth |
|-----------|-----------|-----|------|---------|------------|
| **Roughing** | 12mm end mill | 8,000 | 1,200 | Flood | 6mm |
| **Finishing** | 8mm ball mill | 12,000 | 800 | Mist | 0.5mm |
| **Drilling** | Carbide drill | 6,000 | 300 peck | Flood | 3mm peck |
| **Threading** | Form tap | 1,000 | Lead | Mist | N/A |

---

## 4. Edge Finishing and Secondary Operations

### 4.1 Edge Quality Standards

**Visual Quality Grades:**

| Grade | Description | Applications | Post-Processing |
|-------|-------------|--------------|-----------------|
| **Industrial** | Visible tool marks, acceptable burrs | Hidden mounting brackets | None required |
| **Commercial** | Minor marks, deburred edges | Machine guards, displays | Light sanding |
| **Optical** | Mirror finish, no visible defects | Viewing windows, lenses | Full polishing |

### 4.2 Edge Polishing Techniques

**For Optical-Grade Edges:**

[Bakway's polishing services](https://polycarbonate.cc/plastic-polishing/) achieve <1μm Ra surface roughness using a 4-stage process:

1. **Sanding:** 400-grit wet sanding to remove tool marks
2. **Fine sanding:** 800-grit preparation
3. **Flame polishing:** Propane torch at 45° angle, 150mm distance, 2-3 passes
4. **Buffing:** Cotton wheel with polishing compound

**Critical Safety Warning:**
Flame polishing generates toxic fumes (phenol, carbon monoxide). Always use:
- Exhaust ventilation (minimum 500 CFM)
- Respiratory protection (P100 filters minimum)
- Fire extinguisher within 3 meters

**Alternative: Diamond Polishing**
For high-volume production, diamond abrasive belts achieve 80% of flame polish clarity with:
- Consistent results (no operator variability)
- No toxic fumes
- Faster processing (5 seconds vs 30 seconds per edge)

### 4.3 Drilling and Hole Quality

**Common Defects and Solutions:**

| Defect | Cause | Solution |
|--------|-------|----------|
| **Cracking** | Excessive feed, dull drill | Peck cycle, sharpen/replace drill |
| **Burr formation** | Wrong point angle | Use 130° point angle, not 118° |
| **Hole elongation** | Drill wander, no pilot | Center drill first, rigid setup |
| **Burning** | Excessive speed, no coolant | Reduce RPM, add coolant |

**Recommended Drill Geometry for PC:**
- Point angle: 130° (not standard 118°)
- Lip relief: 12-15°
- Helix angle: 25-30°
- Material: Solid carbide preferred

---

## 5. Design Guidelines for Manufacturability

### 5.1 CAD/CAM Best Practices

**Feature Size Limitations:**

| Feature | Minimum Size | Notes |
|---------|-------------|-------|
| **Internal corner radius** | 1.5× material thickness | Sharp corners = stress concentrators |
| **Hole diameter** | ≥1.5× thickness | Smaller holes risk cracking |
| **Slot width** | ≥2.0× thickness | Narrow slots distort |
| **Wall thickness** | ≥3mm | Thinner walls vibrate |
| **Text engraving** | ≥0.8mm line width | Thinner fills with PC |

**Nesting and Material Optimization:**

For a recent automotive project producing 15,000 display bezels:
- **Original design:** 45% material utilization
- **Optimized with Bakway DFM feedback:** 72% utilization
- **Annual savings:** $47,000 in material costs

**Key nesting strategies:**
1. Share cut lines between parts where tolerance allows
2. Orient parts to align with material grain (extrusion direction)
3. Place small parts inside cutouts of large parts

### 5.2 Tolerance Specifications

**Standard Tolerances ( achievable without special fixturing):**

| Dimension Type | Standard Tolerance | Precision Tolerance |
|----------------|-------------------|-------------------|
| **Linear dimensions** | ±0.15mm | ±0.05mm |
| **Hole diameter** | ±0.10mm | ±0.03mm |
| **Hole position** | ±0.20mm | ±0.08mm |
| **Angles** | ±0.5° | ±0.2° |
| **Surface profile** | ±0.25mm | ±0.10mm |

**Achieving Precision Tolerances:**
- Temperature-controlled environment (20°2°C)
- Rigid fixturing with hydraulic clamps
- Tool path optimization (climb milling preferred)
- In-process measurement (probe-equipped machines)

---

## 6. Quality Control and Troubleshooting

### 6.1 In-Process Inspection

**Bakway's QC Protocol (every 50 parts or 2 hours):**

1. **Dimensional check:**
   - Caliper measurement of critical dimensions
   - Go/no-go gauges for holes
   - CMM (Coordinate Measuring Machine) for complex profiles

2. **Visual inspection:**
   - 10x magnification for edge quality
   - Polarized light check for stress (using photoelasticity)
   - backlight check for internal cracks

3. **Functional testing:**
   - Fit checks with mating parts
   - Torque tests for threaded holes

### 6.2 Common Problems and Solutions

**Problem: Chipped edges on exit side**

- **Cause:** Tool pushing material out instead of cutting
- **Solution:**
  - Reduce feed rate by 25%
  - Use backing material (sacrificial MDF sheet)
  - Switch to down-cut spiral (compression) router bit

**Problem: Melted/burnt edges**

- **Cause:** Excessive heat from dull tool or wrong speed
- **Solution:**
  - Replace tool immediately
  - Reduce spindle RPM by 30%
  - Add compressed air cooling
  - Increase feed rate (counter-intuitive but effective)

**Problem: Dimensional drift during long runs**

- **Cause:** Thermal expansion of material or machine
- **Solution:**
  - Allow 30-minute warmup cycle
  - Use temperature-compensated tooling
  - Measure first-off, mid-run, and last-off parts

**Problem: Internal cracks after machining**

- **Cause:** Residual stress from aggressive cutting
- **Solution:**
  - Reduce pass depth
  - [Anneal parts](https://polycarbonate.cc/plastic-bending-gluing/) after machining
  - Review tool path for stress concentration

---

## 7. Cost Optimization Strategies

### 7.1 Design for Manufacturing (DFM) Impact

**Case Study: Medical Device Enclosure Redesign**

A customer approached us with a [solid PC enclosure](https://polycarbonate.cc/product/solid-pc-sheets/) design that was prohibitively expensive:

- **Original design:** 
  - 12 internal pockets requiring 3D contouring
  - 40 drilled holes
  - Optical-grade edge finish on all surfaces
  - Quote: $89/part

- **Bakway DFM optimization:**
  - Replaced pockets with bent profiles using [plastic bending](https://polycarbonate.cc/plastic-bending-gluing/)
  - Consolidated holes into slots where possible
  - Specified optical finish only on visible edges
  - Final cost: $34/part (62% reduction)

### 7.2 Volume Pricing Breakpoints

**Typical CNC Machining Cost Structure:**

| Quantity | Setup Cost | Per-Part Cost | Total per Part |
|----------|-----------|---------------|----------------|
| **Prototype (1-5)** | $150-300 | $25-50 | $175-350 |
| **Low volume (10-50)** | $150 | $12-20 | $15-23 |
| **Medium (100-500)** | $150 | $6-10 | $6.30-10.30 |
| **High (1,000+)** | $150 | $3-5 | $3.15-5.15 |

**Key insight:** Setup costs dominate at low volumes. For prototypes, consider [laser cutting acrylic prototypes](https://polycarbonate.cc/laser-cutting/) first (only for form/fit testing, not functional PC testing), then switch to CNC machined PC for final validation.

---

## Frequently Asked Questions

**Q: Can I laser cut polycarbonate sheets?**  
A: **No.** Laser cutting is not suitable for polycarbonate and will produce yellowed, rough edges with poor dimensional accuracy. Additionally, laser cutting PC releases toxic fumes (benzene derivatives). For thermal cutting, use [CNC routing with mechanical tools](https://polycarbonate.cc/cnc-routingmachining-cnc/). **Note:** Laser cutting works well for acrylic (PMMA) with clean edges, but PC requires mechanical cutting methods.

**Q: What is the thickest polycarbonate you can CNC machine?**  
A: At Bakway, we regularly machine [solid PC sheets](https://polycarbonate.cc/product/solid-pc-sheets/) up to 50mm thick. For thicknesses above 25mm, we recommend:
- Flood coolant systems (not just mist)
- Multi-pass roughing strategies
- Mandatory post-machining annealing
- Extended cycle times (thick material cuts 60% slower than 10mm sheets)

**Q: How do I prevent stress cracking after CNC machining?**  
A: Stress cracking results from residual machining stresses combining with environmental stressors. Prevention strategies:
1. Use sharp tools (reduces cutting forces)
2. Maintain proper chip load (0.05-0.15mm)
3. Avoid aggressive feeds on final passes
4. [Anneal thick sections](https://polycarbonate.cc/plastic-bending-gluing/) (120°C for 2 hours)
5. Design with generous radii (no sharp internal corners)

**Q: Can you achieve optical clarity on machined edges?**  
A: Yes, through our [diamond polishing](https://polycarbonate.cc/plastic-polishing/) and flame polishing processes. Machined edges start at Ra 3.2μm (good). After polishing, we achieve Ra <0.1μm (optical grade). This is essential for viewing windows, display cases, and medical devices where edge visibility matters.

**Q: What file formats do you accept for CNC programming?**  
A: We accept native CAD formats (SolidWorks, AutoCAD, Inventor) and neutral formats (STEP, IGES, DXF). For 2D cutting, provide DXF or DWG with clearly defined cut paths. For 3D machining, STEP files with dimensional drawings are preferred. Always include tolerance callouts and critical dimension highlights.

---

## References

1. ASTM D3892 - Standard Practice for Packaging/Packing of Plastics
2. ISO 2768-1 - General tolerances for linear and angular dimensions
3. "Machining of Plastics: Technical Handbook" - Quadrant Engineering Plastic Products
4. [Bakway CNC Fabrication Technical Guide](https://polycarbonate.cc/cnc-routingmachining-cnc/)
5. "Thermoplastics Machining: A Guide to Best Practice" - BPF (British Plastics Federation)
6. Tool Manufacturer Data: Onsrud, Vortex, and LMT Onsrud cutting parameters for polycarbonate

---

## Related Resources

- [CNC Routing and Machining Services](https://polycarbonate.cc/cnc-routingmachining-cnc/)
- [Solid PC Sheets for Machining](https://polycarbonate.cc/product/solid-pc-sheets/)
- [Multiwall PC Sheets](https://polycarbonate.cc/product/multiwall-pc-sheets/)
- [Plastic Bending and Gluing](https://polycarbonate.cc/plastic-bending-gluing/)
- [Edge Polishing Services](https://polycarbonate.cc/plastic-polishing/)
- [Laser Cutting (Acrylic Only, Not PC)](https://polycarbonate.cc/laser-cutting/)

---

## About This Guide

This technical guide was developed by **Bakway Advanced Material** engineering team based on 15+ years of CNC processing experience and 50,000+ annual fabrication jobs across our 15,000㎢ processing facility in Suzhou, China.

**About the Author:**  
**James Wilson** is Senior Fabrication Engineer at Bakway with 20+ years of precision machining experience. He specializes in high-volume CNC production optimization and has developed proprietary tooling geometries for multiwall polycarbonate processing. He holds certifications from FANUC and Haas CNC systems and has trained over 200 operators in plastics machining best practices.

**Company Capabilities:**
- 15,000㎢ dedicated processing workshop
- 12 CNC machining centers (up to 3m x 6m bed size)
- In-house tool grinding and customization
- ISO 9001 quality management with CMM inspection
- Prototype to high-volume production (1 to 100,000+ units)

**Need CNC fabrication support?**  
[Contact our engineering team](https://polycarbonate.cc/) for:
- DFM (Design for Manufacturing) consultation
- Prototype development
- Production optimization
- Tooling recommendations
- Cost reduction analysis

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**License:** MIT (Code examples) / CC BY 4.0 (Content)

---

*Disclaimer: This guide provides general fabrication principles based on field experience. Specific applications may require parameter adjustment. Always conduct test cuts on sample material before full production. For safety-critical applications (medical, aerospace), consult with qualified engineers and conduct validation testing.*
