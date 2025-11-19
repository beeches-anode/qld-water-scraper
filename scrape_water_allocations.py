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

def clean_text(text):
    if not text: return ""
    return " ".join(text.split())

def clean_number(text):
    if not text: return 0.0
    clean_text = re.sub(r'[^\d.]', '', text)
    try:
        return float(clean_text)
    except ValueError:
        return 0.0

def get_scheme_links():
    print(f"🔍 Fetching index page: {BASE_URL}")
    try:
        response = requests.get(BASE_URL, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Error fetching index: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    schemes = []
    
    content_div = soup.find('div', id='content') or soup.find('body')
    current_area = "Unknown Area"
    
    # Blocklist: Headers to IGNORE so we don't accidentally label things as "Water"
    IGNORE_HEADERS = [
        "water supply schemes", 
        "water management areas", 
        "water markets",
        "current locations", 
        "contact us", 
        "search",
        "water", 
        "menu"
    ]

    print("👉 Scanning page structure...")
    
    # Iterate through elements to find Headers (Areas) and Links (Schemes)
    for element in content_div.find_all(['h2', 'h3', 'h4', 'span', 'a']):
        
        # If it's a Header, update the "Current Area"
        is_header = False
        if element.name in ['h2', 'h3', 'h4']:
            is_header = True
        elif element.name == 'span' and 'heading-text' in element.get('class', []):
            is_header = True

        if is_header:
            text = clean_text(element.get_text(strip=True))
            
            # Skip empty or ignored headers
            if not text or any(phrase in text.lower() for phrase in IGNORE_HEADERS):
                continue
            
            # Skip extremely short headers (likely navigation noise)
            if len(text) < 4: 
                continue

            # If we found a valid-looking header, update our tracker
            # e.g. "Burnett Basin water plan area" -> "Burnett Basin"
            clean_area = text.replace(' water plan area', '').replace(' water plan', '').replace(' Water Management Protocol', '').strip()
            current_area = clean_area
            # print(f"   Found Area Header: {current_area}")
        
        # If it's a Link, check if it's a scheme
        elif element.name == 'a':
            href = element.get('href')
            text = clean_text(element.get_text(strip=True))
            
            if href and ('current-locations' in href) and href != BASE_URL:
                full_url = urljoin(BASE_URL, href)
                
                # Basic filter to ignore sidebar links
                if text and len(text) > 3 and "read about" not in text.lower():
                    
                    # Determine Type from link text
                    scheme_type = "Unknown"
                    if "(supplemented)" in text.lower():
                        scheme_type = "Supplemented"
                    elif "(unsupplemented)" in text.lower():
                        scheme_type = "Unsupplemented"

                    schemes.append({
                        "Water Area": current_area,
                        "Scheme Name": text, 
                        "Type": scheme_type,
                        "URL": full_url
                    })
    
    # Remove duplicates
    unique_schemes = list({v['URL']: v for v in schemes}.values())
    print(f"✅ Found {len(unique_schemes)} unique schemes.")
    return unique_schemes

def scrape_scheme_details(scheme_info):
    url = scheme_info['URL']
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Failed to load {scheme_info['Scheme Name']}: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    
    # 1. Get Real Scheme Name from Page Title (H1)
    # This fixes the "Current location..." generic name issue
    h1_tag = soup.find('h1')
    real_name = scheme_info['Scheme Name']
    
    if h1_tag:
        h1_text = clean_text(h1_tag.get_text(strip=True))
        # Remove common prefixes
        clean = h1_text.replace("Current location of water allocations in the ", "")
        clean = clean.replace("Current location of water allocations in ", "")
        real_name = clean.strip()
    
    # Fallback: use URL slug if name is still generic
    if "current location" in real_name.lower():
        slug = url.rstrip('/').split('/')[-1]
        real_name = slug.replace('-', ' ').title()

    tables = soup.find_all("table")
    rows_data = []

    for table in tables:
        # 2. Priority Detection
        priority = "Unspecified"
        # Look at previous headings/paragraphs
        prev_elements = table.find_all_previous(['h2', 'h3', 'h4', 'h5', 'strong', 'p'], limit=5)
        
        for prev in prev_elements:
            txt = clean_text(prev.get_text(strip=True)).lower()
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

        # 3. Table Parsing
        headers = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        
        try:
            # Find column indexes
            loc_idx = next(i for i, h in enumerate(headers) if any(x in h for x in ['location', 'zone', 'sub-area']))
            curr_vol_idx = next(i for i, h in enumerate(headers) if 'current' in h)
            # Optional columns
            max_vol_idx = next((i for i, h in enumerate(headers) if 'maximum' in h), None)
        except StopIteration:
            continue # Skip tables that aren't allocation data

        # Read Rows
        for row in table.find_all('tr')[1:]:
            cols = row.find_all(['td', 'th'])
            col_texts = [clean_text(ele.get_text(strip=True)) for ele in cols]
            
            if len(col_texts) <= max(loc_idx, curr_vol_idx): continue
            
            location = col_texts[loc_idx]
            current_vol = clean_number(col_texts[curr_vol_idx])
            max_vol = clean_number(col_texts[max_vol_idx]) if max_vol_idx is not None and len(col_texts) > max_vol_idx else 0.0
            headroom = max_vol - current_vol if max_vol > 0 else 0.0

            rows_data.append({
                "Water Area": scheme_info['Water Area'],
                "Scheme": real_name,
                "Type": scheme_info['Type'],
                "Priority Group": priority,
                "Zone/Location": location,
                "Current Volume (ML)": current_vol,
                "Maximum Volume (ML)": max_vol,
                "Trading Headroom (ML)": headroom
            })
            
    return rows_data

def main():
    print("--- Starting Local Scraper ---")
    start_time = time.time()
    schemes = get_scheme_links()
    
    all_data = []
    print(f"\nProcessing {len(schemes)} schemes...")
    
    for i, scheme in enumerate(schemes):
        # Print progress so you know it's working
        print(f"[{i+1}/{len(schemes)}] {scheme['Water Area']} -> {scheme['Scheme Name']}")
        
        scheme_data = scrape_scheme_details(scheme)
        all_data.extend(scheme_data)
        
        # Be polite to the server
        time.sleep(0.2) 

    if all_data:
        df = pd.DataFrame(all_data)
        
        # Filter out rows where "Water Area" is clearly wrong/generic
        df = df[~df['Water Area'].isin(["Water", "Water markets", "Current locations"])]
        
        df.to_csv("qld_water_allocations.csv", index=False)
        print(f"\n✅ Success! Saved {len(df)} records to 'qld_water_allocations.csv'")
        print(f"⏱️ Total time: {round(time.time() - start_time, 2)}s")
    else:
        print("\n❌ No data extracted.")

if __name__ == "__main__":
    main()