import Papa from 'papaparse';

export interface WaterAllocation {
  'Water Area': string;
  Scheme: string;
  Type: string;
  'Priority Group': string;
  'Zone/Location': string;
  'Current Volume (ML)': number;
  'Maximum Volume (ML)': number;
  'Trading Headroom (ML)': number;
}

export interface WaterPlan {
  'Plan Name': string;
  URL: string;
  'Status Summary': string;
  'Estimated Expiry': string;
}

const DATA_URLS = {
  allocations: 'https://raw.githubusercontent.com/beeches-anode/qld-water-scraper/main/qld_water_allocations.csv',
  plans: 'https://raw.githubusercontent.com/beeches-anode/qld-water-scraper/main/qld_water_plans.csv',
};

export async function fetchWaterAllocations(): Promise<WaterAllocation[]> {
  try {
    const response = await fetch(DATA_URLS.allocations, { next: { revalidate: 3600 } });
    const csvText = await response.text();
    
    const { data } = Papa.parse<WaterAllocation>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return data;
  } catch (error) {
    console.error("Failed to fetch allocations:", error);
    return [];
  }
}

export async function fetchWaterPlans(): Promise<WaterPlan[]> {
  try {
    const response = await fetch(DATA_URLS.plans, { next: { revalidate: 3600 } });
    const csvText = await response.text();
    
    const { data } = Papa.parse<WaterPlan>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}

