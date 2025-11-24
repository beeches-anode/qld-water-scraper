import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface UnallocatedWater {
  Basin: string;
  'Water Management Protocol Link': string;
  'Entity held in reserve for': string;
  Location: string;
  'Reserve Volume (ML)': number;
  Purpose: string;
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
