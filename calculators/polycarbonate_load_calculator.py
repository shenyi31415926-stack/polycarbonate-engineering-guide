#!/usr/bin/env python3
"""
Polycarbonate Sheet Load Capacity Calculator
============================================
Engineering tool for calculating maximum span and safety factors
for polycarbonate roofing and glazing applications.

Maintained by: Bakway Advanced Material
Website: https://www.polycarbonate.cc
License: MIT

Usage:
    python polycarbonate_load_calculator.py --load 1.5 --thickness 10 --type twin-wall
    python polycarbonate_load_calculator.py --interactive
"""

import argparse
import json
from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class MaterialSpec:
    """Material specifications for polycarbonate sheets"""
    thickness: int  # mm
    type: str  # "solid", "twin-wall", "triple-wall"
    section_modulus: float  # mm³/m
    moment_of_inertia: float  # mm⁴/m
    weight: float  # kg/m²
    u_value: float  # W/m²K
    light_transmission: float  # %
    max_stress: float = 12.0  # MPa (allowable flexural stress with safety factor)


# Manufacturer test data - based on Bakway specifications
MATERIAL_DATABASE = {
    "solid": {
        3: MaterialSpec(3, "solid", 15000, 22500, 3.6, 5.6, 90),
        4: MaterialSpec(4, "solid", 26667, 53333, 4.8, 5.4, 90),
        5: MaterialSpec(5, "solid", 41667, 104167, 6.0, 5.2, 89),
        6: MaterialSpec(6, "solid", 60000, 180000, 7.2, 5.0, 89),
        8: MaterialSpec(8, "solid", 106667, 426667, 9.6, 4.8, 88),
        10: MaterialSpec(10, "solid", 166667, 833333, 12.0, 4.6, 88),
    },
    "twin-wall": {
        4: MaterialSpec(4, "twin-wall", 12000, 24000, 0.8, 3.5, 82),
        6: MaterialSpec(6, "twin-wall", 28000, 84000, 1.0, 2.8, 80),
        8: MaterialSpec(8, "twin-wall", 65000, 260000, 1.3, 2.6, 78),
        10: MaterialSpec(10, "twin-wall", 95000, 475000, 1.5, 2.4, 76),
    },
    "triple-wall": {
        10: MaterialSpec(10, "triple-wall", 75000, 375000, 1.2, 2.1, 74),
        16: MaterialSpec(16, "triple-wall", 210000, 1680000, 1.7, 1.8, 70),
        20: MaterialSpec(20, "triple-wall", 380000, 3800000, 2.1, 1.6, 66),
    }
}


class LoadCalculator:
    """Calculator for polycarbonate load capacity"""
    
    def __init__(self, safety_factor: float = 1.5):
        self.safety_factor = safety_factor
    
    def calculate_max_span_stress_based(self, material: MaterialSpec, 
                                       load_kn_m2: float) -> float:
        """
        Calculate maximum span based on flexural stress
        Formula: span = sqrt(8 * I * allowable_stress / load)
        """
        allowable_stress = material.max_stress / self.safety_factor  # MPa
        load_n_mm2 = load_kn_m2 * 0.001  # Convert kN/m² to N/mm²
        
        # span² = 8 * I * allowable_stress / load
        span_squared = (8 * material.moment_of_inertia * allowable_stress) / load_n_mm2
        span_mm = (span_squared) ** 0.5
        span_m = span_mm / 1000
        
        return round(span_m, 2)
    
    def calculate_max_span_deflection_based(self, material: MaterialSpec,
                                           load_kn_m2: float,
                                           max_deflection_ratio: float = 200) -> float:
        """
        Calculate maximum span based on deflection limit (typically span/200)
        E = 2300 MPa (flexural modulus for polycarbonate)
        """
        E = 2300  # MPa
        load_n_mm2 = load_kn_m2 * 0.001
        
        # Deflection-limited span calculation
        # For simply supported beam: deflection = 5 * w * L⁴ / (384 * E * I)
        # Setting deflection = L/200 and solving for L
        
        L_cubed = (384 * E * material.moment_of_inertia * 200) / (5 * load_n_mm2 * 1000)
        span_mm = L_cubed ** (1/3)
        span_m = span_mm / 1000
        
        return round(span_m, 2)
    
    def calculate_governing_span(self, material: MaterialSpec, 
                                load_kn_m2: float) -> Dict:
        """
        Calculate both stress and deflection governed spans
        Return the more conservative (lower) value
        """
        span_stress = self.calculate_max_span_stress_based(material, load_kn_m2)
        span_deflection = self.calculate_max_span_deflection_based(material, load_kn_m2)
        
        # For multiwall, deflection usually governs
        # For solid, stress usually governs
        governing_type = "deflection" if span_deflection < span_stress else "stress"
        governing_span = min(span_stress, span_deflection)
        
        return {
            "span_stress_based_m": span_stress,
            "span_deflection_based_m": span_deflection,
            "governing_span_m": governing_span,
            "governing_factor": governing_type,
            "safety_factor_applied": self.safety_factor
        }
    
    def calculate_actual_stress(self, material: MaterialSpec, 
                               load_kn_m2: float, 
                               actual_span_m: float) -> Dict:
        """Calculate actual stress for a given span"""
        load_n_mm2 = load_kn_m2 * 0.001
        span_mm = actual_span_m * 1000
        
        # Maximum moment for simply supported beam: M = w*L²/8
        max_moment = (load_n_mm2 * span_mm ** 2) / 8  # N·mm/mm
        
        # Stress = M / Z
        actual_stress = max_moment / material.section_modulus  # MPa
        stress_ratio = actual_stress / material.max_stress
        
        return {
            "actual_stress_mpa": round(actual_stress, 2),
            "allowable_stress_mpa": material.max_stress,
            "stress_ratio": round(stress_ratio, 2),
            "safety_margin": round((1 - stress_ratio) * 100, 1),
            "status": "PASS" if stress_ratio < 1/self.safety_factor else "FAIL"
        }
    
    def generate_report(self, material_type: str, thickness: int, 
                       load_kn_m2: float, location: str = "") -> str:
        """Generate a comprehensive engineering report"""
        
        if material_type not in MATERIAL_DATABASE:
            return f"Error: Unknown material type '{material_type}'"
        
        if thickness not in MATERIAL_DATABASE[material_type]:
            available = list(MATERIAL_DATABASE[material_type].keys())
            return f"Error: Thickness {thickness}mm not available. Options: {available}"
        
        material = MATERIAL_DATABASE[material_type][thickness]
        span_results = self.calculate_governing_span(material, load_kn_m2)
        
        report = f"""
{'='*70}
POLYCARBONATE LOAD CAPACITY CALCULATION REPORT
{'='*70}

PROJECT INFORMATION
-------------------
Material Type:      {material.type.replace('-', ' ').title()}
Thickness:          {material.thickness} mm
Design Load:        {load_kn_m2} kN/m²
Safety Factor:      {self.safety_factor}:1
Location:           {location if location else 'Not specified'}

MATERIAL PROPERTIES
-------------------
Section Modulus:    {material.section_modulus:,} mm³/m
Moment of Inertia:  {material.moment_of_inertia:,} mm⁴/m
Weight:             {material.weight} kg/m²
U-Value:            {material.u_value} W/m²K
Light Transmission: {material.light_transmission}%

CALCULATION RESULTS
-------------------
Stress-Based Max Span:      {span_results['span_stress_based_m']} m
Deflection-Based Max Span:  {span_results['span_deflection_based_m']} m

GOVERNING SPAN:             {span_results['governing_span_m']} m
({span_results['governing_factor'].title()}-governed design)

DESIGN RECOMMENDATIONS
----------------------
- Maximum support spacing: {span_results['governing_span_m']} meters
- Recommended: {span_results['governing_span_m'] * 0.9:.2f} m (10% safety margin)
- For continuous spans: {span_results['governing_span_m'] * 1.1:.2f} m (multi-span advantage)

NOTES
-----
- Calculations based on simply supported beam assumption
- Load includes snow, wind, or live loads as specified
- Local building codes may require additional safety factors
- Deflection limit: span/200

REFERENCES
----------
- Material data: Bakway Technical Datasheets
- Standards: ASTM D3935, ISO 178
- Website: https://www.polycarbonate.cc
- Contact: https://www.polycarbonate.cc/contact-us/

{'='*70}
Report generated: LoadCalculator v1.0
This calculation is for reference only. Consult a structural engineer
for project-specific design verification.
{'='*70}
"""
        return report


def interactive_mode():
    """Run calculator in interactive mode"""
    print("\n" + "="*70)
    print("POLYCARBONATE LOAD CAPACITY CALCULATOR")
    print("Bakway Advanced Material - https://www.polycarbonate.cc")
    print("="*70 + "\n")
    
    calc = LoadCalculator()
    
    # Get material type
    print("Available material types:")
    for i, mat_type in enumerate(MATERIAL_DATABASE.keys(), 1):
        thicknesses = list(MATERIAL_DATABASE[mat_type].keys())
        print(f"  {i}. {mat_type.replace('-', ' ').title()} (thickness: {thicknesses})")
    
    type_choice = input("\nSelect material type (name): ").strip().lower()
    
    if type_choice not in MATERIAL_DATABASE:
        print(f"Error: Invalid material type '{type_choice}'")
        return
    
    # Get thickness
    available_thicknesses = list(MATERIAL_DATABASE[type_choice].keys())
    print(f"\nAvailable thicknesses: {available_thicknesses} mm")
    
    try:
        thickness = int(input("Select thickness (mm): ").strip())
    except ValueError:
        print("Error: Please enter a number")
        return
    
    if thickness not in available_thicknesses:
        print(f"Error: Thickness {thickness}mm not available")
        return
    
    # Get load
    try:
        load = float(input("\nEnter design load (kN/m²): ").strip())
    except ValueError:
        print("Error: Please enter a number")
        return
    
    # Get location
    location = input("Project location (optional): ").strip()
    
    # Generate report
    report = calc.generate_report(type_choice, thickness, load, location)
    print(report)
    
    # Save option
    save_option = input("\nSave report to file? (y/n): ").strip().lower()
    if save_option == 'y':
        filename = f"load_calc_{type_choice}_{thickness}mm_{load}kN.txt"
        with open(filename, 'w') as f:
            f.write(report)
        print(f"Report saved to: {filename}")


def main():
    parser = argparse.ArgumentParser(
        description="Polycarbonate Load Capacity Calculator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Calculate for 10mm twin-wall under 1.5 kN/m² snow load
  python %(prog)s --type twin-wall --thickness 10 --load 1.5

  # Calculate with custom safety factor
  python %(prog)s --type solid --thickness 6 --load 2.0 --safety-factor 2.0

  # Interactive mode
  python %(prog)s --interactive

For more information: https://www.polycarbonate.cc
        """
    )
    
    parser.add_argument("--type", "-t", 
                       choices=["solid", "twin-wall", "triple-wall"],
                       help="Material type")
    parser.add_argument("--thickness", "-th", type=int,
                       help="Sheet thickness in mm")
    parser.add_argument("--load", "-l", type=float,
                       help="Design load in kN/m² (1.0-3.0 typical)")
    parser.add_argument("--safety-factor", "-sf", type=float, default=1.5,
                       help="Safety factor (default: 1.5)")
    parser.add_argument("--location",
                       help="Project location for reference")
    parser.add_argument("--interactive", "-i", action="store_true",
                       help="Run in interactive mode")
    parser.add_argument("--json", "-j", action="store_true",
                       help="Output results as JSON")
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_mode()
        return
    
    # Validate required args
    if not all([args.type, args.thickness, args.load]):
        parser.print_help()
        print("\nError: --type, --thickness, and --load are required (or use --interactive)")
        return
    
    # Calculate
    calc = LoadCalculator(safety_factor=args.safety_factor)
    
    if args.json:
        material = MATERIAL_DATABASE.get(args.type, {}).get(args.thickness)
        if material:
            results = calc.calculate_governing_span(material, args.load)
            print(json.dumps(results, indent=2))
        else:
            print(json.dumps({"error": "Invalid material specification"}))
    else:
        report = calc.generate_report(args.type, args.thickness, 
                                     args.load, args.location or "")
        print(report)


if __name__ == "__main__":
    main()
