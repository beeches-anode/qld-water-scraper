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

def get_scheme_links():
    print(f"Fetching index page: {BASE_URL}")
    try:
        response = requests.get(BASE_URL, headers=HEADERS)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching index: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    schemes = []
    
    content_div = soup.find('div', id='content') or soup.find('body')
    current_plan = "Unknown Plan"
    
    IGNORE_PHRASES = [
        "water supply schemes", "management areas", "water markets",
        "current locations", "contact us", "search"
    ]

    for element in content_div.find_all(['h2', 'h3', 'h4', 'a']):
        if element.name in ['h2', 'h3', 'h4']:
            text = clean_text(element.get_text(strip=True))
            
            if any(phrase in text.lower() for phrase in IGNORE_PHRASES):
                continue

            if "Water" in text or "Basin" in text or "Plan" in text:
                clean_plan = text.replace(' water plan area', '').replace(' water plan', '').strip()
                current_plan = clean_plan
        
        elif element.name == 'a':
            href = element.get('href')
            text = clean_text(element.get_text(strip=True))
            
            if href and ('current-locations' in href) and href != BASE_URL:
                full_url = urljoin(BASE_URL, href)
                if text and len(text) > 3 and "read about" not in text.lower():
                    schemes.append({
                        "Water Plan": current_plan,
                        "Scheme Name": text, 
                        "URL": full_url
                    })
    
    unique_schemes = list({v['URL']: v for v in schemes}.values())
    # Filter out any that accidentally got assigned to the generic header
    final_schemes = [s for s in unique_schemes if "water supply schemes" not in s['Water Plan'].lower()]
    print(f"Found {len(final_schemes)} unique schemes to scrape.")
    return final_schemes

def clean_number(text):
    if not text: return 0.0
    clean_text = re.sub(r'[^\d.]', '', text)
    try:
        return float(clean_text)
    except ValueError:
        return 0.0

def scrape_scheme_details(scheme_info):
    url = scheme_info['URL']
    # print(f"  Scraping: {scheme_info['Scheme Name']}...")
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except Exception:
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    
    # 1. Get Real Scheme Name from H1
    h1_tag = soup.find('h1')
    real_name = scheme_info['Scheme Name']
    if h1_tag:
        h1_text = h1_tag.get_text(strip=True)
        clean = h1_text.replace("Current location of water allocations in the ", "")
        clean = clean.replace("Current location of water allocations in ", "")
        real_name = clean.strip()
    
    # Backup if name is still generic
    if "current location" in real_name.lower():
        slug = url.rstrip('/').split('/')[-1]
        real_name = slug.replace('-', ' ').title()

    tables = soup.find_all("table")
    rows_data = []

    for table in tables:
        # --- PRIORITY DETECTION STRATEGY ---
        # Look at the 3 preceding elements. Usually the Priority is in a Heading tag right above.
        priority = "Unspecified"
        
        # We scan previous siblings/elements to find context
        prev_elements = table.find_all_previous(['h2', 'h3', 'h4', 'h5', 'strong', 'p'], limit=3)
        
        for prev in prev_elements:
            txt = prev.get_text(strip=True).lower()
            
            # If we hit a "Nominal Volumes" header, keep going up one more step
            if "nominal volumes" in txt: continue
            
            # Keywords
            if "high" in txt:
                priority = "High Priority"
                if "a1" in txt: priority = "High-A1 Priority"
                if "a2" in txt: priority = "High-A2 Priority"
                break
            if "medium" in txt:
                priority = "Medium Priority"
                if "a1" in txt: priority = "Medium-A1 Priority"
                break
            if "unsupplemented" in txt:
                priority = "Unsupplemented"
                break
        
        # Fallback: Check if the scheme name itself implies type
        if priority == "Unspecified" and "unsupplemented" in real_name.lower():
            priority = "Unsupplemented"

        # --- Table Parsing ---
        headers = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        
        try:
            loc_idx = next(i for i, h in enumerate(headers) if any(x in h for x in ['location', 'zone', 'sub-area']))
            curr_vol_idx = next(i for i, h in enumerate(headers) if 'current' in h)
            # Optional columns
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
                "Water Plan": scheme_info['Water Plan'],
                "Scheme": real_name,
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
    print("--- Starting Water Allocation Scraper ---")
    schemes = get_scheme_links()
    
    all_data = []
    for i, scheme in enumerate(schemes):
        print(f"[{i+1}/{len(schemes)}] {scheme['Scheme Name']}")
        scheme_data = scrape_scheme_details(scheme)
        all_data.extend(scheme_data)
        time.sleep(0.5) # Be polite

    if all_data:
        df = pd.DataFrame(all_data)
        df = df.sort_values(by=['Water Plan', 'Scheme', 'Priority Group', 'Zone/Location'])
        df.to_csv("qld_water_allocations.csv", index=False)
        print(f"\nSuccess! Saved {len(df)} allocation records.")
    else:
        print("\nNo data extracted.")

if __name__ == "__main__":
    main()
