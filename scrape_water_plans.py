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

    # 2. Look for "Expiry" keywords in the text
    expiry_year = "Unknown"
    body_text = soup.get_text().lower()
    
    # Simple regex to find years near "expiry" or "expires"
    # This is rough but often effective for summary data
    if "expiry" in body_text or "expire" in body_text:
        # Check common years
        for year in range(2024, 2035):
            if str(year) in status_text: # Prioritize the status section
                expiry_year = str(year)
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
