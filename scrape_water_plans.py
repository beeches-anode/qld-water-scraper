import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
from urllib.parse import urljoin

BASE_URL = "https://www.business.qld.gov.au/industries/mining-energy-water/water/catchments-planning/water-plan-areas"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def get_plan_links():
    print(f"Fetching Plan List: {BASE_URL}")
    try:
        response = requests.get(BASE_URL, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        print(e)
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    plans = []
    
    # Find the main list of links (usually in a content div)
    # We look for links that contain 'water-plan-areas/'
    content_div = soup.find('div', id='content') or soup.find('body')
    
    for a in content_div.find_all('a', href=True):
        href = a['href']
        if '/water-plan-areas/' in href and href != BASE_URL:
            # Clean name
            name = a.get_text(strip=True)
            if "Enquiries" in name: continue
            
            plans.append({
                "Plan Name": name.replace(" water plan area", "").strip(),
                "URL": urljoin(BASE_URL, href)
            })
            
    # Remove duplicates
    return list({v['URL']: v for v in plans}.values())

def scrape_plan_details(plan_info):
    url = plan_info['URL']
    try:
        response = requests.get(url, headers=HEADERS)
    except:
        return plan_info

    soup = BeautifulSoup(response.content, "html.parser")
    
    # 1. Look for "What's happening?" section
    # This is usually an H2 or H3 followed by text
    status_text = "Operational" # Default
    
    whats_happening_header = soup.find(lambda tag: tag.name in ['h2', 'h3'] and "what's happening" in tag.get_text(strip=True).lower())
    
    if whats_happening_header:
        # Get the text immediately following this header
        # It might be a <p> or a <ul>
        next_elem = whats_happening_header.find_next_sibling()
        if next_elem:
            status_text = next_elem.get_text(" | ", strip=True)
            
            # Truncate if too long (some pages have huge lists)
            if len(status_text) > 300:
                status_text = status_text[:300] + "..."

    # 2. Look for "Expiry" keywords and extract full dates
    expiry_year = "Unknown"
    body_text = soup.get_text()
    body_text_lower = body_text.lower()
    
    # Month names for date parsing (case-insensitive matching)
    months = ['january', 'february', 'march', 'april', 'may', 'june',
              'july', 'august', 'september', 'october', 'november', 'december']
    
    # Pattern 1: Look for "expiry date...until [date]" or "in place until [date]"
    # Matches patterns like "until 19 April 2027" or "expiry date...until 19 April 2027"
    expiry_patterns = [
        r'expiry\s+date[^.]*?until\s+(\d{1,2})\s+(' + '|'.join(months) + r')\s+(\d{4})',
        r'in\s+place\s+until\s+(\d{1,2})\s+(' + '|'.join(months) + r')\s+(\d{4})',
        r'expires?\s+(\d{1,2})\s+(' + '|'.join(months) + r')\s+(\d{4})',
        r'expiry\s+date[^.]*?(\d{1,2})\s+(' + '|'.join(months) + r')\s+(\d{4})',
        r'until\s+(\d{1,2})\s+(' + '|'.join(months) + r')\s+(\d{4})',
    ]
    
    found_date = None
    if "expiry" in body_text_lower or "expire" in body_text_lower:
        # Search in original body_text with case-insensitive matching
        for pattern in expiry_patterns:
            matches = re.finditer(pattern, body_text, re.IGNORECASE)
            for match in matches:
                day, month, year = match.groups()
                year_int = int(year)
                # Only accept reasonable future years (2024-2040)
                if 2024 <= year_int <= 2040:
                    found_date = (day, month, year)
                    expiry_year = year
                    break
            if found_date:
                break
    
    # Pattern 2: Fallback - look for years near expiry keywords in full text
    # This handles cases where dates aren't in standard format
    if expiry_year == "Unknown" and ("expiry" in body_text_lower or "expire" in body_text_lower):
        # Find context around expiry keywords (up to 200 chars before/after)
        expiry_contexts = []
        for match in re.finditer(r'expir(?:y|ies|ed|ing)', body_text_lower):
            start = max(0, match.start() - 200)
            end = min(len(body_text), match.end() + 200)
            expiry_contexts.append(body_text[start:end])
        
        # Look for years in these contexts
        for context in expiry_contexts:
            for year in range(2024, 2041):
                if str(year) in context:
                    expiry_year = str(year)
                    break
            if expiry_year != "Unknown":
                break
    
    plan_info['Status Summary'] = status_text
    plan_info['Estimated Expiry'] = expiry_year
    return plan_info

def main():
    print("--- Starting Water Plan Status Scraper ---")
    plans = get_plan_links()
    print(f"Found {len(plans)} plans.")
    
    detailed_plans = []
    for plan in plans:
        print(f"Checking: {plan['Plan Name']}")
        data = scrape_plan_details(plan)
        detailed_plans.append(data)
        time.sleep(0.5)
        
    df = pd.DataFrame(detailed_plans)
    df.to_csv("qld_water_plans.csv", index=False)
    print("Success! Saved qld_water_plans.csv")

if __name__ == "__main__":
    main()
