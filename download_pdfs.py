import requests
import pandas as pd
import os
from pathlib import Path
import time
from urllib.parse import urlparse
from scrape_unallocated_reserves import is_pdf_link, find_pdf_on_page

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Create pdfs directory
pdf_dir = Path("pdfs")
pdf_dir.mkdir(exist_ok=True)

# Read source CSV
source_df = pd.read_csv('water_management_protocols.csv')
print(f"Downloading {len(source_df)} PDFs...\n")

downloaded = 0
failed = []

for idx, row in source_df.iterrows():
    basin = row['Basin/Plan Area']
    doc_type = row['Document Type']
    link = row['Direct Document Link']

    # Clean basin name for filename
    safe_basin = basin.replace('/', '-').replace('&', 'and').replace(' ', '_')
    filename = f"{safe_basin}_{doc_type}.pdf"
    filepath = pdf_dir / filename

    print(f"{idx + 1}/{len(source_df)} {basin} ({doc_type})")

    # Check if already downloaded
    if filepath.exists():
        print(f"  ✓ Already exists: {filename}")
        downloaded += 1
        continue

    # Get PDF URL
    if is_pdf_link(link):
        pdf_url = link
    else:
        print(f"  Finding PDF on page...")
        pdf_url = find_pdf_on_page(link)
        if not pdf_url:
            print(f"  ✗ No PDF found")
            failed.append(basin)
            continue

    # Download PDF
    try:
        print(f"  Downloading from {pdf_url[:60]}...")
        response = requests.get(pdf_url, headers=HEADERS, timeout=60)
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            f.write(response.content)

        file_size_mb = len(response.content) / 1024 / 1024
        print(f"  ✓ Saved: {filename} ({file_size_mb:.1f} MB)")
        downloaded += 1

        # Be respectful to servers
        time.sleep(1)

    except Exception as e:
        print(f"  ✗ Error: {e}")
        failed.append(basin)

print(f"\n{'='*80}")
print(f"Downloaded: {downloaded}/{len(source_df)} PDFs")
print(f"Saved to: {pdf_dir.absolute()}")
if failed:
    print(f"\nFailed ({len(failed)}): {', '.join(failed)}")
print(f"{'='*80}")
