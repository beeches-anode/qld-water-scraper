import Papa from 'papaparse';

export interface WaterTrade {
  Date: string;
  'Water Plan Area': string;
  Scheme: string;
  Type: string;
  Priority: string;
  'Trade Type': string;
  'Volume (ML)': number;
  'Price ($/ML)': number;
  'Location From': string;
  'Location To': string;
  Source: string;
}

// Parsed date for sorting/filtering
export interface WaterTradeWithParsedDate extends WaterTrade {
  parsedDate: Date | null;
  monthYear: string;
}

const DATA_URL = 'https://raw.githubusercontent.com/beeches-anode/qld-water-scraper/main/qld_water_trading.csv';
const METADATA_URL = 'https://raw.githubusercontent.com/beeches-anode/qld-water-scraper/main/qld_water_trading_metadata.json';

export interface TradingMetadata {
  is_synthetic: boolean;
  scrape_date: string;
  record_count: number;
  schemes_count: number;
  water_plan_areas_count: number;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
  source: string;
}

export async function fetchTradingMetadata(): Promise<TradingMetadata | null> {
  try {
    const response = await fetch(METADATA_URL, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch trading metadata:", error);
    return null;
  }
}

export async function fetchWaterTrading(): Promise<WaterTradeWithParsedDate[]> {
  try {
    const response = await fetch(DATA_URL, { next: { revalidate: 3600 } });
    const csvText = await response.text();

    const { data } = Papa.parse<WaterTrade>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    // Parse dates and add month/year for grouping
    return data.map(trade => {
      const parsedDate = parseTradeDate(trade.Date);
      return {
        ...trade,
        parsedDate,
        monthYear: parsedDate ? formatMonthYear(parsedDate) : trade.Date,
      };
    });
  } catch (error) {
    console.error("Failed to fetch trading data:", error);
    return [];
  }
}

function parseTradeDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try various date formats
  // Format 1: "2024-11-15" (ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Format 2: "Nov 2024" or "November 2024"
  const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthNames: Record<string, number> = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'sept': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11,
    };

    const month = monthNames[monthYearMatch[1].toLowerCase()];
    const year = parseInt(monthYearMatch[2]);

    if (month !== undefined && !isNaN(year)) {
      return new Date(year, month, 15); // Use middle of month
    }
  }

  // Format 3: Try Date.parse as fallback
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }

  return null;
}

function formatMonthYear(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Helper functions for data aggregation

export interface MonthlyPriceData {
  monthYear: string;
  date: Date;
  avgPrice: number;
  totalVolume: number;
  tradeCount: number;
}

export function aggregateByMonth(trades: WaterTradeWithParsedDate[]): MonthlyPriceData[] {
  const byMonth = new Map<string, { prices: number[], volumes: number[], count: number, date: Date }>();

  for (const trade of trades) {
    if (!trade.parsedDate || trade['Price ($/ML)'] <= 0) continue;

    const key = trade.monthYear;
    const existing = byMonth.get(key) || { prices: [], volumes: [], count: 0, date: trade.parsedDate };

    existing.prices.push(trade['Price ($/ML)']);
    existing.volumes.push(trade['Volume (ML)'] || 0);
    existing.count++;

    byMonth.set(key, existing);
  }

  const result: MonthlyPriceData[] = [];

  for (const [monthYear, data] of byMonth) {
    // Calculate volume-weighted average price
    const totalVolume = data.volumes.reduce((a, b) => a + b, 0);
    let avgPrice: number;

    if (totalVolume > 0) {
      avgPrice = data.prices.reduce((sum, price, i) => sum + price * data.volumes[i], 0) / totalVolume;
    } else {
      avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    }

    result.push({
      monthYear,
      date: data.date,
      avgPrice: Math.round(avgPrice * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      tradeCount: data.count,
    });
  }

  // Sort by date
  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  return result;
}

export interface SchemeStats {
  scheme: string;
  waterPlanArea: string;
  avgPrice: number;
  totalVolume: number;
  tradeCount: number;
  minPrice: number;
  maxPrice: number;
}

export function aggregateByScheme(trades: WaterTradeWithParsedDate[]): SchemeStats[] {
  const byScheme = new Map<string, {
    waterPlanArea: string,
    prices: number[],
    volumes: number[],
    count: number
  }>();

  for (const trade of trades) {
    if (trade['Price ($/ML)'] <= 0) continue;

    const key = trade.Scheme;
    const existing = byScheme.get(key) || {
      waterPlanArea: trade['Water Plan Area'],
      prices: [],
      volumes: [],
      count: 0
    };

    existing.prices.push(trade['Price ($/ML)']);
    existing.volumes.push(trade['Volume (ML)'] || 0);
    existing.count++;

    byScheme.set(key, existing);
  }

  const result: SchemeStats[] = [];

  for (const [scheme, data] of byScheme) {
    const totalVolume = data.volumes.reduce((a, b) => a + b, 0);
    let avgPrice: number;

    if (totalVolume > 0) {
      avgPrice = data.prices.reduce((sum, price, i) => sum + price * data.volumes[i], 0) / totalVolume;
    } else {
      avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    }

    result.push({
      scheme,
      waterPlanArea: data.waterPlanArea,
      avgPrice: Math.round(avgPrice * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      tradeCount: data.count,
      minPrice: Math.min(...data.prices),
      maxPrice: Math.max(...data.prices),
    });
  }

  // Sort by total volume descending
  result.sort((a, b) => b.totalVolume - a.totalVolume);

  return result;
}
