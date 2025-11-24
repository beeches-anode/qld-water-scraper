import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface UnallocatedWater {
  'Water plan area': string;
  'Catchment/Sub-catchment/Location': string;
  'Reserve type': string;
  Purpose: string;
  'Water Plan volume (ML)': number;
  'Volume granted (ML)': number;
  'Volume remaining (ML)': number;
  Notes: string;
  'Protocol Link': string;
  'Other Link': string;
}

export async function getUnallocatedWater(): Promise<UnallocatedWater[]> {
  const csvPath = path.join(process.cwd(), '..', 'unallocated_water_reserves.csv');

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const { data } = Papa.parse<UnallocatedWater>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return data;
  } catch (error) {
    console.error('Error loading unallocated water data:', error);
    return [];
  }
}
