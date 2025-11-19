import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
from urllib.parse import urljoin

# --- Configuration ---
# The main index page that lists all water plans and their schemes
BASE_URL = "https://www.business.qld.gov.au/industries/mining-energy-water/water/water-markets/current-locations"

# Headers to mimic a real browser (Chrome) to avoid being blocked by security filters
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

def get_scheme_links():
    """
    Scrapes the main index page to dynamically find all water schemes and their URLs,
    grouped by their parent Water Plan.
    """
    print(f"Fetching index page: {BASE_URL}")
    try:
        response = requests.get(BASE_URL, headers=HEADERS)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching index: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    schemes = []
    
    # The page structure usually lists Water Plans in <h3> tags and schemes in <ul> lists below them.
    # We iterate through the main content area to map schemes to their plans.
    content_div = soup.find('div', id='content') or soup.find('body')

    current_plan = "Unknown Plan"
    
    # Iterate through all elements to find headers (Plans) and links (Schemes) in order
    for element in content_div.find_all(['h2', 'h3', 'h4', 'a']):
        if element.name in ['h2', 'h3', 'h4']:
            text = element.get_text(strip=True)
            # We only care about headers that look like Water Plans
            if "Water" in text or "Basin" in text or "Plan" in text:
                # specific cleanup for common headers
                clean_plan = text.replace(' water plan area', '').replace(' water plan', '').strip()
                current_plan = clean_plan
        
        elif element.name == 'a':
            href = element.get('href')
            text = element.get_text(strip=True)
            
            # Filter for relevant links (containing 'current-locations' or relative paths)
            if href and ('current-locations' in href) and href != BASE_URL:
                full_url = urljoin(BASE_URL, href)
                
                # Filter out navigation links or "read about" links
                if text and len(text) > 3 and "read about" not in text.lower():
                    schemes.append({
                        "Water Plan": current_plan,
                        "Scheme Name": text,
                        "URL": full_url
                    })
    
    # Remove duplicates based on URL (using a dictionary comprehension)
    unique_schemes = list({v['URL']: v for v in schemes}.values())
    print(f"Found {len(unique_schemes)} unique schemes to scrape.")
    return unique_schemes

def clean_number(text):
    """
    Converts string numbers (e.g., '1,234 ML', '10.5') to float.
    Returns 0 if the text is invalid or empty.
    """
    if not text:
        return 0.0
    # Remove commas, 'ML', spaces, and non-breaking spaces
    # Keep only digits and the decimal point
    clean_text = re.sub(r'[^\d.]', '', text)
    try:
        return float(clean_text)
    except ValueError:
        return 0.0

def scrape_scheme_details(scheme_info):
    """
    Visits a specific scheme page and extracts allocation tables.
    It attempts to intelligently identify Priority Groups from headers above tables.
    """
    url = scheme_info['URL']
    print(f"  Scraping: {scheme_info['Scheme Name']}...")
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        print(f"    Failed to load {url}: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    tables = soup.find_all("table")
    
    rows_data = []
    
    if not tables:
        print(f"    No tables found.")
        return []

    for table in tables:
        # 1. Identify Context (Priority Group)
        # Look at the element immediately preceding the table (h3, h4, p) to find "High Priority", "Medium", etc.
        priority = "General/Unspecified"
        prev_element = table.find_previous(['h2', 'h3', 'h4', 'h5', 'p'])
        if prev_element:
            header_text = prev_element.get_text(strip=True)
            if "High" in header_text:
                priority = "High Priority"
            elif "Medium" in header_text:
                priority = "Medium Priority"
            elif "Unsupplemented" in header_text:
                priority = "Unsupplemented"
        
        # 2. Parse Table Headers to find column indices
        # We convert headers to lowercase for case-insensitive matching
        headers = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        
        try:
            # Find the index of critical columns. If we can't find Location or Current Volume, skip the table.
            loc_idx = next(i for i, h in enumerate(headers) if 'location' in h or 'zone' in h or 'sub-area' in h)
            curr_vol_idx = next(i for i, h in enumerate(headers) if 'current' in h)
            
            # Optional columns (might not exist on all pages)
            min_vol_idx = next((i for i, h in enumerate(headers) if 'minimum' in h), None)
            max_vol_idx = next((i for i, h in enumerate(headers) if 'maximum' in h), None)
            proj_vol_idx = next((i for i, h in enumerate(headers) if 'projected' in h), None)
            
        except StopIteration:
            # Skip tables that don't look like allocation data (e.g., contact tables)
            continue

        # 3. Parse Table Rows
        table_rows = table.find_all('tr')
        for row in table_rows[1:]: # Skip the header row
            cols = row.find_all(['td', 'th'])
            if not cols: continue
            
            # Extract clean text from all columns
            col_texts = [ele.get_text(strip=True) for ele in cols]
            
            # Safety check: ensure row has enough columns
            if len(col_texts) <= max(loc_idx, curr_vol_idx):
                continue

            # Extract Data
            location = col_texts[loc_idx]
            current_vol = clean_number(col_texts[curr_vol_idx])
            
            min_vol = clean_number(col_texts[min_vol_idx]) if min_vol_idx is not None else 0.0
            max_vol = clean_number(col_texts[max_vol_idx]) if max_vol_idx is not None else 0.0
            proj_vol = clean_number(col_texts[proj_vol_idx]) if proj_vol_idx is not None else 0.0
            
            # Calculate "Headroom" (Available space in zone) if Max Volume exists
            headroom = max_vol - current_vol if max_vol > 0 else 0.0

            rows_data.append({
                "Water Plan": scheme_info['Water Plan'],
                "Scheme": scheme_info['Scheme Name'],
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
    
    # 1. Discovery Phase
    schemes = get_scheme_links()
    
    if not schemes:
        print("No schemes found. Check internet connection or URL.")
        return

    all_data = []
    
    # 2. Extraction Phase
    for i, scheme in enumerate(schemes):
        scheme_data = scrape_scheme_details(scheme)
        all_data.extend(scheme_data)
        
        # Sleep briefly to be polite to the server and avoid rate limits
        time.sleep(1) 

    # 3. Export Phase
    if all_data:
        df = pd.DataFrame(all_data)
        
        # Sort for readability
        df = df.sort_values(by=['Water Plan', 'Scheme', 'Priority Group', 'Zone/Location'])
        
        filename = "qld_water_allocations.csv"
        df.to_csv(filename, index=False)
        
        print(f"\nSuccess! Scraped {len(df)} rows from {len(schemes)} schemes.")
        print(f"Data saved to: {filename}")
        print(f"Total time: {round(time.time() - start_time, 2)} seconds")
        
        # Display a sample
        print("\nData Preview:")
        print(df[['Scheme', 'Zone/Location', 'Priority Group', 'Current Volume (ML)']].head(10))
    else:
        print("\nNo data extracted.")

if __name__ == "__main__":
    main()
