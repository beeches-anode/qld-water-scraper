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
    
    for element in content_div.find_all(['h2', 'h3', 'h4', 'a']):
        if element.name in ['h2', 'h3', 'h4']:
            text = element.get_text(strip=True)
            if "Water" in text or "Basin" in text or "Plan" in text:
                clean_plan = text.replace(' water plan area', '').replace(' water plan', '').strip()
                current_plan = clean_plan
        
        elif element.name == 'a':
            href = element.get('href')
            text = element.get_text(strip=True)
            
            if href and ('current-locations' in href) and href != BASE_URL:
                full_url = urljoin(BASE_URL, href)
                # We grab the link, but we will fix the name in the detailed scrape function
                if text and len(text) > 3 and "read about" not in text.lower():
                    schemes.append({
                        "Water Plan": current_plan,
                        "Scheme Name": text, # Temporary name, will be updated
                        "URL": full_url
                    })
    
    unique_schemes = list({v['URL']: v for v in schemes}.values())
    print(f"Found {len(unique_schemes)} unique schemes to scrape.")
    return unique_schemes

def clean_number(text):
    if not text: return 0.0
    clean_text = re.sub(r'[^\d.]', '', text)
    try:
        return float(clean_text)
    except ValueError:
        return 0.0

def scrape_scheme_details(scheme_info):
    url = scheme_info['URL']
    print(f"  Scraping URL: {url}...")
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        print(f"    Failed to load: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    
    # --- FIX: Get the REAL Scheme Name from the Page Title ---
    # The index link text is often generic ("Current location..."). 
    # The H1 on the destination page usually contains the full, correct name.
    h1_tag = soup.find('h1')
    real_scheme_name = scheme_info['Scheme Name'] # Default fallback
    
    if h1_tag:
        h1_text = h1_tag.get_text(strip=True)
        # Clean up the title to extract just the scheme name
        # e.g. "Current location of water allocations in the Burdekin Haughton Water Supply Scheme" -> "Burdekin Haughton Water Supply Scheme"
        clean_name = h1_text.replace("Current location of water allocations in the ", "")
        clean_name = clean_name.replace("Current location of water allocations in ", "")
        real_scheme_name = clean_name.strip()
        print(f"    Identified Scheme: {real_scheme_name}")

    tables = soup.find_all("table")
    rows_data = []
    
    if not tables:
        print(f"    No tables found.")
        return []

    for table in tables:
        priority = "General/Unspecified"
        prev_element = table.find_previous(['h2', 'h3', 'h4', 'h5', 'p'])
        if prev_element:
            header_text = prev_element.get_text(strip=True)
            if "High" in header_text: priority = "High Priority"
            elif "Medium" in header_text: priority = "Medium Priority"
            elif "Unsupplemented" in header_text: priority = "Unsupplemented"
        
        headers = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        
        try:
            loc_idx = next(i for i, h in enumerate(headers) if 'location' in h or 'zone' in h or 'sub-area' in h)
            curr_vol_idx = next(i for i, h in enumerate(headers) if 'current' in h)
            min_vol_idx = next((i for i, h in enumerate(headers) if 'minimum' in h), None)
            max_vol_idx = next((i for i, h in enumerate(headers) if 'maximum' in h), None)
            proj_vol_idx = next((i for i, h in enumerate(headers) if 'projected' in h), None)
        except StopIteration:
            continue 

        for row in table.find_all('tr')[1:]:
            cols = row.find_all(['td', 'th'])
            col_texts = [ele.get_text(strip=True) for ele in cols]
            
            if len(col_texts) <= max(loc_idx, curr_vol_idx):
                continue
            
            location = col_texts[loc_idx]
            current_vol = clean_number(col_texts[curr_vol_idx])
            min_vol = clean_number(col_texts[min_vol_idx]) if min_vol_idx is not None and len(col_texts) > min_vol_idx else 0.0
            max_vol = clean_number(col_texts[max_vol_idx]) if max_vol_idx is not None and len(col_texts) > max_vol_idx else 0.0
            proj_vol = clean_number(col_texts[proj_vol_idx]) if proj_vol_idx is not None and len(col_texts) > proj_vol_idx else 0.0
            
            headroom = max_vol - current_vol if max_vol > 0 else 0.0

            rows_data.append({
                "Water Plan": scheme_info['Water Plan'],
                "Scheme": real_scheme_name, # Use the fixed name
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
    print("--- Starting Queensland Water Allocation Scraper ---")
    start_time = time.time()
    schemes = get_scheme_links()
    
    if not schemes:
        print("No schemes found.")
        return

    all_data = []
    for i, scheme in enumerate(schemes):
        scheme_data = scrape_scheme_details(scheme)
        all_data.extend(scheme_data)
        time.sleep(1) 

    if all_data:
        df = pd.DataFrame(all_data)
        df = df.sort_values(by=['Water Plan', 'Scheme', 'Priority Group', 'Zone/Location'])
        
        filename = "qld_water_allocations.csv"
        df.to_csv(filename, index=False)
        
        print(f"\nSuccess! Scraped {len(df)} rows.")
        print(f"Data saved to: {filename}")
    else:
        print("\nNo data extracted.")

if __name__ == "__main__":
    main()
