"""
Queensland Water Trading Data Scraper

Aggregates water trading data from multiple sources:
1. Sunwater Temporary Transfer Sale Information (HTML tables)
2. QLD Open Data Portal - Temporary Trade Sales Information (CSV/API)
3. QLD Government Permanent Water Trading Reports (PDF) - future enhancement

Output: qld_water_trading.csv with columns:
- Date: Trade date
- Water Plan Area: e.g., "Burnett Basin"
- Scheme: Water supply scheme name
- Type: "Supplemented" or "Unsupplemented"
- Priority: Priority group (High, Medium, etc.)
- Trade Type: "Temporary" or "Permanent"
- Volume (ML): Volume traded
- Price ($/ML): Price per megalitre
- Location From: Source location (if available)
- Location To: Destination location (if available)
- Source: Data source identifier
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
import json
from datetime import datetime, timedelta
from urllib.parse import urljoin
import os

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Sunwater schemes and their water plan areas
SUNWATER_SCHEMES = {
    "Barker Barambah": "Burnett Basin",
    "Bowen Broken Rivers": "Burdekin Basin",
    "Boyne River and Tarong": "Burnett Basin",
    "Bundaberg": "Burnett Basin",
    "Burdekin Haughton": "Burdekin Basin",
    "Callide Valley": "Fitzroy Basin",
    "Chinchilla Weir": "Condamine and Balonne",
    "Cunnamulla": "Warrego, Paroo, Bulloo and Nebine",
    "Dawson Valley": "Fitzroy Basin",
    "Eton": "Pioneer Valley",
    "Lower Fitzroy": "Fitzroy Basin",
    "Lower Mary River": "Mary Basin",
    "Macintyre Brook": "Border Rivers and Moonie",
    "Maranoa River": "Condamine and Balonne",
    "Mareeba Dimbulah": "Barron",
    "Nogoa Mackenzie": "Fitzroy Basin",
    "Pioneer River": "Pioneer Valley",
    "Proserpine River": "Whitsunday",
    "St George": "Condamine and Balonne",
    "Three Moon Creek": "Burnett Basin",
    "Upper Burnett": "Burnett Basin",
    "Upper Condamine": "Condamine and Balonne",
}


def scrape_sunwater():
    """
    Scrape Sunwater temporary transfer sale information.

    Sunwater publishes per-ML sale prices, volumes, and locations for all
    schemes under Resource Operations License requirements.

    Data available from January 2022 onwards (July 2021 for some schemes).
    """
    print("\n--- Scraping Sunwater Temporary Transfers ---")
    results = []

    base_url = "https://www.sunwater.com.au/water-for-sale/water-trading/temporary-transfer-sale-information/"

    try:
        response = requests.get(base_url, headers=HEADERS, timeout=60)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching Sunwater page: {e}")
        return results

    soup = BeautifulSoup(response.content, "html.parser")

    # Look for data tables on the page
    tables = soup.find_all('table')

    for table in tables:
        rows = table.find_all('tr')
        if len(rows) < 2:
            continue

        # Get headers
        header_row = rows[0]
        headers = [th.get_text(strip=True).lower() for th in header_row.find_all(['th', 'td'])]

        # Look for columns
        scheme_col = None
        date_col = None
        price_col = None
        volume_col = None
        from_col = None
        to_col = None

        for idx, h in enumerate(headers):
            if 'scheme' in h or 'wss' in h:
                scheme_col = idx
            elif 'date' in h:
                date_col = idx
            elif 'price' in h or '$/ml' in h:
                price_col = idx
            elif 'volume' in h or 'ml' in h:
                volume_col = idx
            elif 'from' in h:
                from_col = idx
            elif 'to' in h:
                to_col = idx

        # Process data rows
        for row in rows[1:]:
            cols = row.find_all(['td', 'th'])
            if len(cols) < 3:
                continue

            col_texts = [col.get_text(strip=True) for col in cols]

            try:
                scheme = col_texts[scheme_col] if scheme_col is not None and len(col_texts) > scheme_col else ""
                date_str = col_texts[date_col] if date_col is not None and len(col_texts) > date_col else ""
                price_str = col_texts[price_col] if price_col is not None and len(col_texts) > price_col else "0"
                volume_str = col_texts[volume_col] if volume_col is not None and len(col_texts) > volume_col else "0"
                location_from = col_texts[from_col] if from_col is not None and len(col_texts) > from_col else ""
                location_to = col_texts[to_col] if to_col is not None and len(col_texts) > to_col else ""

                # Parse price
                price = float(re.sub(r'[^\d.]', '', price_str) or 0)

                # Parse volume
                volume = float(re.sub(r'[^\d.]', '', volume_str) or 0)

                # Get water plan area
                water_plan = SUNWATER_SCHEMES.get(scheme, "Unknown")

                if scheme and (price > 0 or volume > 0):
                    results.append({
                        'Date': date_str,
                        'Water Plan Area': water_plan,
                        'Scheme': scheme,
                        'Type': 'Supplemented',  # Sunwater schemes are supplemented
                        'Priority': 'Medium',  # Most temporary trades are medium priority
                        'Trade Type': 'Temporary',
                        'Volume (ML)': volume,
                        'Price ($/ML)': price,
                        'Location From': location_from,
                        'Location To': location_to,
                        'Source': 'Sunwater'
                    })
            except Exception as e:
                continue

    # Also check for JavaScript-loaded content or API endpoints
    # Look for Vue/React data stores or API URLs in the page
    scripts = soup.find_all('script')
    for script in scripts:
        script_text = script.string or ''

        # Look for JSON data embedded in scripts
        json_matches = re.findall(r'\{[^{}]*"scheme"[^{}]*"price"[^{}]*\}', script_text)
        for match in json_matches:
            try:
                data = json.loads(match)
                # Process JSON data if found
            except:
                continue

    print(f"  Found {len(results)} Sunwater trades")
    return results


def scrape_qld_open_data():
    """
    Scrape QLD Open Data Portal for temporary trade sales information.

    Uses CKAN API to access:
    - Temporary Trade Sales Information dataset
    - Seasonal Water Assignment attributes
    """
    print("\n--- Scraping QLD Open Data Portal ---")
    results = []

    # CKAN API endpoints
    api_base = "https://www.data.qld.gov.au/api/3/action"

    # Known dataset/resource IDs for water trading data
    datasets = [
        {
            'name': 'Temporary Trade Sales',
            'package': 'brwss-temporary-trade-sales-information',
        },
        {
            'name': 'Seasonal Water Assignments',
            'resource_id': '2b5ec1b6-cecb-46c0-8371-c6fdf1ed6464',
        }
    ]

    for dataset in datasets:
        try:
            # Try package search first
            if 'package' in dataset:
                url = f"{api_base}/package_show?id={dataset['package']}"
                response = requests.get(url, headers=HEADERS, timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        resources = data.get('result', {}).get('resources', [])
                        for resource in resources:
                            if resource.get('format', '').upper() == 'CSV':
                                csv_url = resource.get('url')
                                if csv_url:
                                    csv_data = fetch_csv_data(csv_url, dataset['name'])
                                    results.extend(csv_data)

            # Try direct resource access
            if 'resource_id' in dataset:
                url = f"{api_base}/datastore_search?resource_id={dataset['resource_id']}&limit=10000"
                response = requests.get(url, headers=HEADERS, timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        records = data.get('result', {}).get('records', [])
                        for record in records:
                            results.append(transform_open_data_record(record, dataset['name']))

        except Exception as e:
            print(f"  Error fetching {dataset['name']}: {e}")
            continue

    print(f"  Found {len(results)} QLD Open Data records")
    return results


def fetch_csv_data(url, source_name):
    """Fetch and parse CSV data from URL"""
    results = []

    try:
        response = requests.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()

        # Parse CSV
        from io import StringIO
        df = pd.read_csv(StringIO(response.text))

        # Transform columns to standard format
        for _, row in df.iterrows():
            record = transform_csv_row(row, source_name)
            if record:
                results.append(record)

    except Exception as e:
        print(f"  Error fetching CSV: {e}")

    return results


def transform_csv_row(row, source_name):
    """Transform a CSV row to standard format"""
    try:
        # Map common column names
        date = row.get('Date', row.get('date', row.get('TRADE_DATE', '')))
        scheme = row.get('Scheme', row.get('scheme', row.get('WSS_NAME', row.get('SCHEME_NAME', ''))))
        volume = row.get('Volume', row.get('volume', row.get('VOLUME_ML', row.get('TRADE_VOLUME', 0))))
        price = row.get('Price', row.get('price', row.get('PRICE_PER_ML', row.get('SALE_PRICE', 0))))
        location_from = row.get('From', row.get('from', row.get('FROM_LOCATION', '')))
        location_to = row.get('To', row.get('to', row.get('TO_LOCATION', '')))
        water_plan = row.get('Water Plan Area', row.get('WATER_PLAN_AREA', ''))
        priority = row.get('Priority', row.get('PRIORITY_GROUP', 'Medium'))

        # Clean numeric values
        try:
            volume = float(re.sub(r'[^\d.]', '', str(volume)) or 0)
        except:
            volume = 0

        try:
            price = float(re.sub(r'[^\d.]', '', str(price)) or 0)
        except:
            price = 0

        if not scheme or (volume == 0 and price == 0):
            return None

        return {
            'Date': str(date),
            'Water Plan Area': water_plan or SUNWATER_SCHEMES.get(scheme, 'Unknown'),
            'Scheme': scheme,
            'Type': 'Supplemented',
            'Priority': priority,
            'Trade Type': 'Temporary',
            'Volume (ML)': volume,
            'Price ($/ML)': price,
            'Location From': str(location_from),
            'Location To': str(location_to),
            'Source': f'QLD Open Data - {source_name}'
        }
    except Exception as e:
        return None


def transform_open_data_record(record, source_name):
    """Transform an Open Data API record to standard format"""
    return {
        'Date': record.get('date', record.get('Date', '')),
        'Water Plan Area': record.get('water_plan_area', record.get('Water Plan Area', 'Unknown')),
        'Scheme': record.get('scheme', record.get('Scheme', '')),
        'Type': record.get('type', 'Supplemented'),
        'Priority': record.get('priority', 'Medium'),
        'Trade Type': 'Temporary',
        'Volume (ML)': float(record.get('volume', record.get('Volume', 0)) or 0),
        'Price ($/ML)': float(record.get('price', record.get('Price', 0)) or 0),
        'Location From': record.get('from_location', record.get('From', '')),
        'Location To': record.get('to_location', record.get('To', '')),
        'Source': f'QLD Open Data - {source_name}'
    }


def scrape_permanent_trading_pdfs():
    """
    Scrape QLD Government Permanent Water Trading Reports (PDFs).

    Reports are published monthly by DLGWV (formerly RDMW) and contain:
    - Supplemented surface water trades
    - Unsupplemented surface water trades

    Each report includes weighted average prices and volumes by scheme/priority.
    """
    print("\n--- Scraping QLD Gov Permanent Trading PDFs ---")
    results = []

    # Known PDF URLs discovered through web search
    pdf_urls = [
        # 2024 reports (dlgwv domain)
        "https://www.dlgwv.qld.gov.au/__data/assets/pdf_file/0005/1989383/pwtr-supplemented-surface-water-dec-2024.pdf",
        "https://www.dlgwv.qld.gov.au/__data/assets/pdf_file/0012/1976583/pwtr-supplemented-surface-water-nov-2024.pdf",
        "https://www.dlgwv.qld.gov.au/__data/assets/pdf_file/0006/1908627/pwtr-supplemented-surface-water-jun-2024.pdf",
        # 2023 reports
        "https://www.dlgwv.qld.gov.au/__data/assets/pdf_file/0004/1775137/pwtr-supplemented-surface-water-september-2023.pdf",
        # 2022-2023 reports (rdmw domain)
        "https://www.rdmw.qld.gov.au/__data/assets/pdf_file/0007/1651345/pwtr-supplemented-oct-2022.pdf",
        "https://www.rdmw.qld.gov.au/__data/assets/pdf_file/0009/1668978/pwtr-unsupplemented-surface-water-jan-2023.pdf",
        "https://www.rdmw.qld.gov.au/__data/assets/pdf_file/0011/1609049/pwtr-supplemented-feb-2022.pdf",
    ]

    # Try to import PDF library
    try:
        import pdfplumber
        pdf_available = True
    except ImportError:
        try:
            import PyPDF2
            pdf_available = 'pypdf2'
        except ImportError:
            pdf_available = False
            print("  PDF libraries not available, skipping PDF scraping")
            return results

    for url in pdf_urls:
        try:
            print(f"  Processing: {url.split('/')[-1]}")
            response = requests.get(url, headers=HEADERS, timeout=60)
            response.raise_for_status()

            from io import BytesIO
            pdf_content = BytesIO(response.content)

            # Extract period from filename
            filename = url.split('/')[-1]
            period_match = re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[-_]?(\d{4})', filename, re.IGNORECASE)
            if period_match:
                month = period_match.group(1)
                year = period_match.group(2)
                period = f"{month.capitalize()} {year}"
            else:
                period = "Unknown"

            # Determine type from filename
            report_type = 'Unsupplemented' if 'unsupplemented' in filename.lower() else 'Supplemented'

            # Extract data based on available library
            if pdf_available == True:  # pdfplumber
                extracted = extract_pdf_data_pdfplumber(pdf_content, period, report_type)
            else:  # PyPDF2
                extracted = extract_pdf_data_pypdf2(pdf_content, period, report_type)

            results.extend(extracted)
            time.sleep(1)  # Be respectful

        except Exception as e:
            print(f"    Error: {e}")
            continue

    print(f"  Found {len(results)} permanent trading records")
    return results


def extract_pdf_data_pdfplumber(pdf_content, period, report_type):
    """Extract trading data using pdfplumber"""
    import pdfplumber
    results = []

    with pdfplumber.open(pdf_content) as pdf:
        current_water_plan = "Unknown"
        current_scheme = "Unknown"

        for page in pdf.pages:
            text = page.extract_text() or ""

            # Look for water plan area headers
            plan_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+water\s+plan\s+area', text, re.IGNORECASE)
            if plan_match:
                current_water_plan = plan_match.group(1).strip()

            # Extract tables
            tables = page.extract_tables()
            for table in tables:
                parsed = parse_trading_pdf_table(table, current_water_plan, period, report_type)
                results.extend(parsed)

    return results


def extract_pdf_data_pypdf2(pdf_content, period, report_type):
    """Extract trading data using PyPDF2 (text-based extraction)"""
    import PyPDF2
    results = []

    reader = PyPDF2.PdfReader(pdf_content)
    full_text = ""

    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    # Parse text for trading data
    # Look for patterns like: Scheme Name | Priority | Trades | Volume | Price
    lines = full_text.split('\n')
    current_water_plan = "Unknown"
    current_scheme = "Unknown"

    for line in lines:
        # Detect water plan area
        plan_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+water\s+plan\s+area', line, re.IGNORECASE)
        if plan_match:
            current_water_plan = plan_match.group(1).strip()
            continue

        # Look for data patterns
        # Pattern: text | priority | number | volume | price
        data_match = re.search(r'([A-Za-z\s]+)\s+(High|Medium|Low)\s+(\d+)\s+([\d,]+)\s+\$?([\d,.]+)', line)
        if data_match:
            results.append({
                'Date': period,
                'Water Plan Area': current_water_plan,
                'Scheme': data_match.group(1).strip(),
                'Type': report_type,
                'Priority': data_match.group(2),
                'Trade Type': 'Permanent',
                'Volume (ML)': float(data_match.group(4).replace(',', '')),
                'Price ($/ML)': float(data_match.group(5).replace(',', '')),
                'Location From': '',
                'Location To': '',
                'Source': 'QLD Gov PWTR'
            })

    return results


def parse_trading_pdf_table(table, water_plan_area, period, report_type):
    """Parse a trading data table from PDF"""
    results = []

    if not table or len(table) < 2:
        return results

    # Find header row
    header_idx = None
    for idx, row in enumerate(table[:3]):
        if not row:
            continue
        row_text = ' '.join([str(c).lower() if c else '' for c in row])
        if any(x in row_text for x in ['scheme', 'priority', 'trades', 'volume', 'price']):
            header_idx = idx
            break

    if header_idx is None:
        return results

    # Find column indices
    headers = [str(c).lower() if c else '' for c in table[header_idx]]
    scheme_col = next((i for i, h in enumerate(headers) if 'scheme' in h), None)
    priority_col = next((i for i, h in enumerate(headers) if 'priority' in h or 'group' in h), None)
    trades_col = next((i for i, h in enumerate(headers) if 'trade' in h or 'number' in h), None)
    volume_col = next((i for i, h in enumerate(headers) if 'volume' in h), None)
    price_col = next((i for i, h in enumerate(headers) if 'price' in h or '$' in h), None)

    # Process rows
    current_scheme = water_plan_area
    for row in table[header_idx + 1:]:
        if not row or len(row) < 2:
            continue

        row_text = ' '.join([str(c) if c else '' for c in row])
        if 'total' in row_text.lower():
            continue

        # Extract values
        scheme = row[scheme_col] if scheme_col and len(row) > scheme_col else current_scheme
        if scheme:
            current_scheme = scheme

        priority = row[priority_col] if priority_col and len(row) > priority_col else 'Medium'

        try:
            volume = float(re.sub(r'[^\d.]', '', str(row[volume_col] if volume_col and len(row) > volume_col else 0)) or 0)
        except:
            volume = 0

        try:
            price = float(re.sub(r'[^\d.]', '', str(row[price_col] if price_col and len(row) > price_col else 0)) or 0)
        except:
            price = 0

        if volume > 0 or price > 0:
            results.append({
                'Date': period,
                'Water Plan Area': water_plan_area,
                'Scheme': str(current_scheme).strip(),
                'Type': report_type,
                'Priority': str(priority).strip() if priority else 'Medium',
                'Trade Type': 'Permanent',
                'Volume (ML)': volume,
                'Price ($/ML)': price,
                'Location From': '',
                'Location To': '',
                'Source': 'QLD Gov PWTR'
            })

    return results


def main():
    print("=" * 60)
    print("QLD Water Trading Data Scraper")
    print("=" * 60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    all_results = []

    # Scrape all sources
    sunwater_data = scrape_sunwater()
    all_results.extend(sunwater_data)

    open_data = scrape_qld_open_data()
    all_results.extend(open_data)

    pdf_data = scrape_permanent_trading_pdfs()
    all_results.extend(pdf_data)

    # Save results
    if all_results:
        df = pd.DataFrame(all_results)

        # Clean up
        df = df.drop_duplicates()
        df = df[df['Scheme'] != '']
        df = df[df['Water Plan Area'] != 'Unknown']

        # Parse dates and sort
        df['Sort Date'] = pd.to_datetime(df['Date'], format='mixed', errors='coerce')
        df = df.sort_values('Sort Date', ascending=False)
        df = df.drop('Sort Date', axis=1)

        output_file = 'qld_water_trading.csv'
        df.to_csv(output_file, index=False)

        print(f"\n{'=' * 60}")
        print(f"SUCCESS! Saved {len(df)} records to {output_file}")
        print(f"{'=' * 60}")

        # Summary
        print("\nSummary:")
        print(f"  Total records: {len(df)}")
        print(f"  Sources: {df['Source'].nunique()}")
        print(f"  Schemes: {df['Scheme'].nunique()}")
        print(f"  Water Plan Areas: {df['Water Plan Area'].nunique()}")

        if len(df) > 0:
            print("\nBy Source:")
            print(df.groupby('Source').size().to_string())

            print("\nBy Trade Type:")
            print(df.groupby('Trade Type').size().to_string())
    else:
        print("\nNo data extracted from any source")
        # Create empty CSV with headers for development
        df = pd.DataFrame(columns=[
            'Date', 'Water Plan Area', 'Scheme', 'Type', 'Priority',
            'Trade Type', 'Volume (ML)', 'Price ($/ML)',
            'Location From', 'Location To', 'Source'
        ])
        df.to_csv('qld_water_trading.csv', index=False)
        print("Created empty qld_water_trading.csv with headers")

    print(f"\nFinished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
