import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const scansDirectory = path.join(process.cwd(), 'content/scans');

export interface ScanData {
  id: string;
  date: string;
  title: string;
  description: string;
  contentHtml?: string;
}

export function getSortedScansData(): ScanData[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(scansDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(scansDirectory);
  const allScansData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(scansDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { date: string; title: string; description: string }),
    };
  });

  // Sort posts by date
  return allScansData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getScanData(id: string): Promise<ScanData> {
  const fullPath = path.join(scansDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; description: string }),
  };
}

