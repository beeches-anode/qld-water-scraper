#!/usr/bin/env python3
"""
Script to populate Protocol Link column in reserves_from_marion.csv
using links from water_management_protocols.csv and unallocated_water_reserves.csv
"""

import csv
import sys
from pathlib import Path

def normalize_basin_name(name):
    """Normalize basin name for matching"""
    if not name:
        return ""
    # Remove extra spaces, normalize ampersands
    name = name.strip()
    name = name.replace("&", "&")
    name = name.replace(" and ", " & ")
    return name

def load_protocol_mappings():
    """Load protocol links from both CSV files and create a mapping"""
    protocol_map = {}
    
    # First, load from water_management_protocols.csv (primary source)
    protocols_file = Path("water_management_protocols.csv")
    if protocols_file.exists():
        with open(protocols_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                basin = normalize_basin_name(row.get('Basin/Plan Area', ''))
                link = row.get('Direct Document Link', '').strip()
                if basin and link:
                    protocol_map[basin] = link
    
    # Then, load from unallocated_water_reserves.csv (fallback/secondary source)
    unallocated_file = Path("unallocated_water_reserves.csv")
    if unallocated_file.exists():
        with open(unallocated_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                basin = normalize_basin_name(row.get('Basin', ''))
                link = row.get('Water Management Protocol Link', '').strip()
                # Only add if not already in map (protocols.csv takes precedence)
                if basin and link and basin not in protocol_map:
                    protocol_map[basin] = link
    
    return protocol_map

def create_basin_name_mapping():
    """Create a mapping of variations in basin names"""
    # Map from reserves_from_marion.csv names to standard names in water_management_protocols.csv
    name_mapping = {
        "Border Rivers & Moonie": "Border Rivers & Moonie",
        "Condamine & Balonne": "Condamine & Balonne",
        "Georgina & Diamantina": "Georgina & Diamantina",
        "Warrego, Paroo, Bulloo & Nebine": "Warrego Paroo Bulloo & Nebine",
        "Burdekin": "Burdekin Basin",
        "Burnett": "Burnett Basin",
        "Mary": "Mary Basin",
        "Fitzroy": "Fitzroy Basin",
        "Calliope": "Calliope River",
        "Logan": "Logan Basin",
        "Whitsunday": "Whitsunday",
        "Baffle Creek": "Baffle Creek",
        "Barron": "Barron",
        "Boyne River": "Boyne River",
        "Cape York": "Cape York",
        "Cooper Creek": "Cooper Creek",
        "Gold Coast": "Gold Coast",
        "Gulf": "Gulf",
        "Mitchell": "Mitchell",
        "Pioneer Valley": "Pioneer Valley",
        "Wet Tropics": "Wet Tropics",
    }
    return name_mapping

def populate_protocol_links():
    """Main function to populate protocol links"""
    reserves_file = Path("reserves_from_marion.csv")
    
    if not reserves_file.exists():
        print(f"Error: {reserves_file} not found")
        return
    
    # Load protocol mappings
    protocol_map = load_protocol_mappings()
    name_mapping = create_basin_name_mapping()
    
    # Read the reserves file
    rows = []
    with open(reserves_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        for row in reader:
            basin_name = row.get('Water plan area', '').strip()
            
            # Map to standard name using our mapping
            mapped_name = name_mapping.get(basin_name, basin_name)
            normalized_mapped = normalize_basin_name(mapped_name)
            
            # Try to get protocol link
            protocol_link = protocol_map.get(normalized_mapped, '')
            
            # If still no match, try direct match with original name
            if not protocol_link:
                normalized_basin = normalize_basin_name(basin_name)
                protocol_link = protocol_map.get(normalized_basin, '')
            
            # Update the Protocol Link column
            row['Protocol Link'] = protocol_link
            
            # Debug output for unmatched basins
            if not protocol_link:
                print(f"Warning: No protocol link found for '{basin_name}' (tried '{mapped_name}')")
            
            rows.append(row)
    
    # Write the updated file
    output_file = Path("reserves_from_marion.csv")
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"Successfully updated {output_file}")
    print(f"Total rows processed: {len(rows)}")
    
    # Print summary of links added
    links_added = sum(1 for row in rows if row.get('Protocol Link'))
    print(f"Protocol links added: {links_added}")

if __name__ == "__main__":
    populate_protocol_links()

