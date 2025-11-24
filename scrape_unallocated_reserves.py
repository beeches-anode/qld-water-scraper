import requests
from bs4 import BeautifulSoup
import pandas as pd
import pdfplumber
import time
import re
import io
from urllib.parse import urljoin, urlparse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def is_pdf_link(url):
    """Check if URL points directly to a PDF"""
    return url.lower().endswith('.pdf')

def find_pdf_on_page(url):
    """Scrape a web page to find PDF link for Water Management Protocol or ROP"""
    print(f"  Searching for PDF on: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"  Error fetching page: {e}")
        return None

    soup = BeautifulSoup(response.content, "html.parser")

    # Priority keywords (try these first, in order)
    priority_keywords = [
        'water management protocol',
        'management protocol',
        'resource operations plan',
    ]

    # Secondary keywords
    secondary_keywords = [
        'protocol',
        'rop',
        'water plan'
    ]

    # Exclusion keywords (avoid these PDFs)
    exclude_keywords = [
        'map',
        'transitions',
        'consultation',
        'assessment',
        'notification',
        'form'
    ]

    # First pass: look for priority keywords
    for keyword in priority_keywords:
        for a in soup.find_all('a', href=True):
            href = a['href']
            if not href.lower().endswith('.pdf'):
                continue

            link_text = a.get_text(strip=True).lower()

            # Skip if contains exclusion keywords
            if any(excl in link_text for excl in exclude_keywords):
                continue

            if keyword in link_text:
                pdf_url = urljoin(url, href)
                print(f"  Found PDF (priority): {pdf_url}")
                return pdf_url

    # Second pass: look for secondary keywords
    for keyword in secondary_keywords:
        for a in soup.find_all('a', href=True):
            href = a['href']
            if not href.lower().endswith('.pdf'):
                continue

            link_text = a.get_text(strip=True).lower()

            # Skip if contains exclusion keywords
            if any(excl in link_text for excl in exclude_keywords):
                continue

            if keyword in link_text:
                pdf_url = urljoin(url, href)
                print(f"  Found PDF: {pdf_url}")
                return pdf_url

    print(f"  No suitable PDF found on page")
    return None

def download_pdf(url):
    """Download PDF content into memory"""
    print(f"  Downloading PDF: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()
        return io.BytesIO(response.content)
    except Exception as e:
        print(f"  Error downloading PDF: {e}")
        return None

def extract_unallocated_reserves(pdf_content, basin_name, protocol_link):
    """Extract unallocated water reserves data from PDF"""
    results = []

    try:
        with pdfplumber.open(pdf_content) as pdf:
            print(f"  PDF has {len(pdf.pages)} pages")

            # Look for "Attachment" pages with reserve tables (usually towards the end)
            # Search pages starting from page 15 onwards where attachments typically are
            start_page = max(1, min(15, len(pdf.pages)))

            for page_num in range(start_page, len(pdf.pages) + 1):
                page = pdf.pages[page_num - 1]
                text = page.extract_text()
                if not text:
                    continue

                # Look for Attachment section with Unallocated water reserves
                # OR pages with "Strategic reserve" table titles
                has_attachment = 'attachment' in text.lower() and 'unallocated' in text.lower()
                has_reserve_table = re.search(r'table\s+\d+.*?strategic.*?reserve', text, re.IGNORECASE) or \
                                   re.search(r'(strategic|indigenous|general)\s+reserve.*?table', text, re.IGNORECASE)

                if has_attachment or has_reserve_table:
                    print(f"  Page {page_num}: Found reserve section/table")

                    # Extract tables using lines strategy (works best for formatted tables)
                    tables = page.extract_tables(table_settings={
                        "vertical_strategy": "lines",
                        "horizontal_strategy": "lines"
                    })

                    if tables:
                        for table_idx, table in enumerate(tables):
                            if len(table) < 3:  # Need header + data
                                continue
                            print(f"    Table {table_idx + 1}: {len(table)} rows")
                            parsed = parse_reserve_table(table, basin_name, protocol_link)
                            if parsed:
                                print(f"    ✓ Extracted {len(parsed)} entries")
                                results.extend(parsed)

    except Exception as e:
        print(f"  Error processing PDF: {e}")
        import traceback
        traceback.print_exc()

    return results

def parse_reserve_table(table, basin_name, protocol_link):
    """Parse a table and extract reserve data with strict validation"""
    results = []

    if not table or len(table) < 3:  # Need header + at least 1 data row
        return results

    # Find header row - handle multiple table formats
    header_row_idx = None
    entity_col = None
    location_col = None
    reserve_col = None
    purpose_col = None  # For tables that separate entity from purpose
    subcatchment_col = None  # For tables with subcatchment column

    for idx, row in enumerate(table[:3]):  # Check first 3 rows for header
        if not row:
            continue

        # Join cells to create row text
        row_text = ' '.join([str(cell).lower() if cell else '' for cell in row])

        # Check for different table formats:
        # Format 1: Entity | Location | Reserve Volume (Mary Basin style)
        # Format 2: Subcatchment | Zone/Location | Reserve Volume | Type | Purpose (Barron style)

        has_entity = 'entity' in row_text or 'held in reserve' in row_text
        has_subcatchment = 'subcatchment' in row_text
        has_location = 'location' in row_text or 'zone' in row_text
        has_reserve = 'reserve' in row_text or 'volume' in row_text

        # Valid if we have (entity OR subcatchment) AND location AND reserve
        if (has_entity or has_subcatchment) and has_location and has_reserve:
            header_row_idx = idx
            # Find column indices
            for col_idx, cell in enumerate(row):
                if not cell:
                    continue
                cell_lower = str(cell).lower()

                # Entity column
                if 'entity' in cell_lower or 'held in reserve' in cell_lower:
                    entity_col = col_idx
                # Subcatchment column
                elif 'subcatchment' in cell_lower:
                    subcatchment_col = col_idx
                # Location column (including "zone and location")
                elif 'location' in cell_lower or 'zone' in cell_lower:
                    if location_col is None:  # Take first match
                        location_col = col_idx
                # Purpose/Type column (check BEFORE reserve, as "Purpose of reserve" contains both)
                elif 'purpose' in cell_lower:
                    purpose_col = col_idx
                # Reserve/Volume column
                elif 'reserve' in cell_lower or 'volume' in cell_lower:
                    if reserve_col is None:  # Take first match
                        reserve_col = col_idx
                # Type column (if not caught by purpose check)
                elif 'type' in cell_lower:
                    if purpose_col is None:
                        purpose_col = col_idx
            break

    # Validation: must have found required columns
    # Either entity_col OR subcatchment_col must be found
    has_entity_col = entity_col is not None or subcatchment_col is not None
    if header_row_idx is None or not has_entity_col or location_col is None or reserve_col is None:
        return results

    # Use subcatchment as entity if entity column not found
    if entity_col is None and subcatchment_col is not None:
        entity_col = subcatchment_col

    # Handle merged cells: if reserve_col seems wrong, try to find it by position
    # In tables with merged headers, volume column is often right after location column
    if reserve_col is not None and location_col is not None:
        # Check if reserve_col is actually empty in data rows (indicating merged cell issue)
        # Try location_col + 1 as the reserve column
        test_row_idx = min(header_row_idx + 2, len(table) - 1)
        if test_row_idx < len(table):
            test_row = table[test_row_idx]
            if len(test_row) > reserve_col and not test_row[reserve_col]:
                # Reserve column is empty, try location + 1
                potential_reserve_col = location_col + 1
                if len(test_row) > potential_reserve_col and test_row[potential_reserve_col]:
                    # Check if this column has numeric data
                    test_value = str(test_row[potential_reserve_col])
                    if any(char.isdigit() for char in test_value):
                        reserve_col = potential_reserve_col

    # Handle merged cells for purpose column (same issue as reserve)
    if purpose_col is not None:
        test_row_idx = min(header_row_idx + 2, len(table) - 1)
        if test_row_idx < len(table):
            test_row = table[test_row_idx]
            if len(test_row) > purpose_col and not test_row[purpose_col]:
                # Purpose column might be one cell earlier due to merged cells
                potential_purpose_col = purpose_col - 1
                if len(test_row) > potential_purpose_col and test_row[potential_purpose_col]:
                    test_value = str(test_row[potential_purpose_col]).strip().lower()
                    # Check if this looks like a purpose value
                    if test_value in ['strategic', 'indigenous', 'general']:
                        purpose_col = potential_purpose_col

    # Process data rows (skip first row if it's just sub-headers like "(average annual volume)")
    start_row = header_row_idx + 1
    if start_row < len(table):
        first_data_row = table[start_row]
        first_data_text = ' '.join([str(cell).lower() if cell else '' for cell in first_data_row])
        if 'average' in first_data_text or 'annual' in first_data_text:
            start_row += 1  # Skip sub-header row

    for row in table[start_row:]:
        max_col = max([c for c in [entity_col, location_col, reserve_col, purpose_col] if c is not None])
        if not row or len(row) <= max_col:
            continue

        entity = str(row[entity_col]).strip() if row[entity_col] else ""
        location = str(row[location_col]).strip() if row[location_col] else ""
        reserve = str(row[reserve_col]).strip() if row[reserve_col] else ""

        # Check purpose column - ONLY extract Strategic reserves
        purpose_value = "Strategic"  # Default for tables without purpose column
        if purpose_col is not None and len(row) > purpose_col:
            purpose = str(row[purpose_col]).strip() if row[purpose_col] else ""
            # Filter: only Strategic reserves
            if purpose.lower() != 'strategic':
                continue
            purpose_value = purpose.capitalize()  # Store the actual value

        # For Barron-style tables with subcatchment column
        if subcatchment_col is not None and entity_col == subcatchment_col:
            subcatchment = entity
            # Combine subcatchment with location: "Subcatchment A, Zone C Lake Placid"
            if subcatchment and location:
                location = f"Subcatchment {subcatchment}, {location}"
            # Set entity to "Not Defined" since Barron doesn't have entity column
            entity = "Not Defined"

        # Validation: entity must exist and be meaningful
        if not entity or entity.lower() in ['none', 'nan', 'null', '']:
            continue

        # Skip header repetitions
        if 'entity' in entity.lower() or 'subcatchment' in entity.lower():
            continue

        # At least one of location or reserve must have content
        if not location and not reserve:
            continue

        # Skip rows where reserve volume is clearly not a number/volume
        if reserve and not any(char.isdigit() for char in reserve):
            continue

        results.append({
            'Basin': basin_name,
            'Water Management Protocol Link': protocol_link,
            'Entity held in reserve for': entity,
            'Location': location,
            'Reserve Volume': reserve,
            'Purpose': purpose_value
        })

    return results

def scrape_protocol(basin, doc_type, link):
    """Main function to scrape a single protocol"""
    print(f"\nProcessing: {basin} ({doc_type})")

    # Determine PDF URL
    if is_pdf_link(link):
        pdf_url = link
    else:
        pdf_url = find_pdf_on_page(link)
        if not pdf_url:
            print(f"  Skipping: No PDF found")
            return []

    # Download PDF
    pdf_content = download_pdf(pdf_url)
    if not pdf_content:
        print(f"  Skipping: Could not download PDF")
        return []

    # Extract data
    results = extract_unallocated_reserves(pdf_content, basin, pdf_url)
    print(f"  Extracted {len(results)} reserve entries")

    return results

def main():
    print("--- Starting Unallocated Water Reserves Scraper ---\n")

    # Read source CSV
    source_df = pd.read_csv('water_management_protocols.csv')
    print(f"Loaded {len(source_df)} protocols from source CSV\n")

    all_results = []

    for idx, row in source_df.iterrows():
        basin = row['Basin/Plan Area']
        doc_type = row['Document Type']
        link = row['Direct Document Link']

        results = scrape_protocol(basin, doc_type, link)
        all_results.extend(results)

        # Be respectful to servers
        time.sleep(2)

    # Save results
    if all_results:
        df = pd.DataFrame(all_results)
        output_file = 'unallocated_water_reserves.csv'
        df.to_csv(output_file, index=False)
        print(f"\n✓ Success! Saved {len(all_results)} entries to {output_file}")
    else:
        print("\n⚠ No data extracted")

if __name__ == "__main__":
    main()
