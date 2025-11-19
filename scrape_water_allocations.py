import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
from urllib.parse import urljoin

# --- Configuration ---
BASE_URL = "https://www.business.qld.gov.au/industries/mining-energy-water/water/water-markets/current-locations"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

def clean_number(text):
    if not text: return 0.0
    clean_text = re.sub(r'[^\d.]', '', text)
    try:
        return float(clean_text)
    except ValueError:
        return 0.0

def get_schemes_hierarchy():
    """
    Parses the index page using DOM traversal to capture:
    Water Area -> Scheme -> Type (Link)
    """
    print(f"Fetching index page: {BASE_URL}")
    try:
        response = requests.get(BASE_URL, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        print(f"Error: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    content_div = soup.find('div', id='content') or soup.find('body')
    
    schemes_list = []
    
    # Find all links that look like data links
    links = content_div.find_all('a', href=True)
    
    for a in links:
        href = a['href']
        link_text = a.get_text(strip=True)
        
        # Filter for relevant links
        if 'current-locations' in href and href != BASE_URL and "read about" not in link_text.lower():
            
            # 1. Determine Type (Supplemented vs Unsupplemented)
            # Usually contained in the brackets of the link text
            scheme_type = "Unknown"
            if "(supplemented)" in link_text.lower():
                scheme_type = "Supplemented"
            elif "(unsupplemented)" in link_text.lower():
                scheme_type = "Unsupplemented"
            
            # 2. Determine Scheme Name (The parent list item text)
            # The structure is usually: <li> Scheme Name <ul> <li> <a>Link</a> ...
            # We look up to the parent <li> of the link's <ul> container
            scheme_name = "Unknown Scheme"
            
            # Traverse up to find the list item containing this link
            parent_li = a.find_parent('li')
            if parent_li:
                # Try to find the parent of this LI (the UL), and then THAT UL's parent (the Scheme LI)
                parent_ul = parent_li.find_parent('ul')
                if parent_ul:
                    scheme_li = parent_ul.find_parent('li')
                    if scheme_li:
                        # Get text of scheme_li but exclude children text
                        scheme_name = scheme_li.find(text=True, recursive=False).strip()
            
            # Fallback: If traversal failed (flat structure), use the link text itself or look for previous sibling
            if scheme_name == "Unknown Scheme" or len(scheme_name) < 3:
                 # Try cleaning the link text "Current location (supplemented)" -> ""
                 # This implies the scheme name might be missing or implicit
                 slug = href.rstrip('/').split('/')[-1]
                 scheme_name = slug.replace('-', ' ').title()

            # 3. Determine Water Area (The preceding Header)
            # Look up from the link to find the nearest preceding H2, H3, or H4
            water_area = "Unknown Area"
            header = a.find_previous(['h2', 'h3', 'h4'])
            if header:
                water_area = header.get_text(strip=True)
                # Cleanup common suffixes
                water_area = water_area.replace(" water plan area", "").replace(" water plan", "").strip()

            # Blocklist check for Area
            if "Water supply schemes" in water_area:
                # This is the main page title, keep looking up?
                # For now, we accept it might be loose, but usually specific headers exist.
                pass

            schemes_list.append({
                "Water Area": water_area,
                "Scheme": scheme_name,
                "Type": scheme_type,
                "URL": urljoin(BASE_URL, href)
            })
            
    print(f"Found {len(schemes_list)} datasets.")
    return schemes_list

def scrape_scheme_details(scheme_info):
    url = scheme_info['URL']
    # print(f"  Scraping: {scheme_info['Scheme']} ({scheme_info['Type']})...")
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except Exception:
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    tables = soup.find_all("table")
    rows_data = []

    for table in tables:
        # Priority Detection
        priority = "Unspecified"
        prev_elements = table.find_all_previous(['h2', 'h3', 'h4', 'h5', 'strong', 'p'], limit=4)
        
        for prev in prev_elements:
            txt = prev.get_text(strip=True).lower()
            if "nominal volumes" in txt: continue
            
            if "high" in txt:
                priority = "High Priority"
                if "a1" in txt: priority = "High-A1 Priority"
                break
            if "medium" in txt:
                priority = "Medium Priority"
                break
            if "unsupplemented" in txt:
                priority = "Unsupplemented"
                break
        
        if priority == "Unspecified" and scheme_info['Type'] == "Unsupplemented":
            priority = "Unsupplemented"

        # Table Parsing
        headers = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        
        try:
            loc_idx = next(i for i, h in enumerate(headers) if any(x in h for x in ['location', 'zone', 'sub-area']))
            curr_vol_idx = next(i for i, h in enumerate(headers) if 'current' in h)
            min_vol_idx = next((i for i, h in enumerate(headers) if 'minimum' in h), None)
            max_vol_idx = next((i for i, h in enumerate(headers) if 'maximum' in h), None)
            proj_vol_idx = next((i for i, h in enumerate(headers) if 'projected' in h), None)
        except StopIteration:
            continue 

        for row in table.find_all('tr')[1:]:
            cols = row.find_all(['td', 'th'])
            col_texts = [ele.get_text(strip=True) for ele in cols]
            
            if len(col_texts) <= max(loc_idx, curr_vol_idx): continue
            
            location = col_texts[loc_idx]
            current_vol = clean_number(col_texts[curr_vol_idx])
            min_vol = clean_number(col_texts[min_vol_idx]) if min_vol_idx is not None and len(col_texts) > min_vol_idx else 0.0
            max_vol = clean_number(col_texts[max_vol_idx]) if max_vol_idx is not None and len(col_texts) > max_vol_idx else 0.0
            proj_vol = clean_number(col_texts[proj_vol_idx]) if proj_vol_idx is not None and len(col_texts) > proj_vol_idx else 0.0
            
            headroom = max_vol - current_vol if max_vol > 0 else 0.0

            rows_data.append({
                "Water Area": scheme_info['Water Area'],
                "Scheme": scheme_info['Scheme'],
                "Type": scheme_info['Type'],
                "Priority Group": priority,
                "Zone/Location": location,
                "Current Volume (ML)": current_vol,
                "Maximum Volume (ML)": max_vol,
                "Trading Headroom (ML)": headroom,
                "Projected Volume (ML)": proj_vol,
                "Minimum Volume (ML)": min_vol,
                "Source URL": url
            })
            
    return rows_data

def main():
    print("--- Starting Water Allocation Scraper (v4.0) ---")
    schemes = get_schemes_hierarchy()
    
    all_data = []
    for i, scheme in enumerate(schemes):
        print(f"[{i+1}/{len(schemes)}] {scheme['Water Area']} -> {scheme['Scheme']}")
        scheme_data = scrape_scheme_details(scheme)
        all_data.extend(scheme_data)
        time.sleep(0.5)

    if all_data:
        df = pd.DataFrame(all_data)
        # Filter out invalid areas if any remain
        df = df[~df['Water Area'].str.contains("Water supply schemes", case=False, na=False)]
        
        df = df.sort_values(by=['Water Area', 'Scheme', 'Type', 'Priority Group', 'Zone/Location'])
        df.to_csv("qld_water_allocations.csv", index=False)
        print(f"\nSuccess! Saved {len(df)} allocation records.")
    else:
        print("\nNo data extracted.")

if __name__ == "__main__":
    main()
