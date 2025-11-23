import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const projectsDirectory = path.join(process.cwd(), 'content/projects');

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  region: string; // Water plan region (e.g., "Burdekin Basin")
  status: 'planning' | 'construction' | 'completed' | 'proposed' | 'discontinued';
  estimatedCost?: string;
  fundingCommitted?: string;
  fundingSources?: string[];
  capacity?: string; // e.g., "2,100 GL"
  irrigationArea?: string; // e.g., "60,000 hectares"
  location?: string;
  organizations?: string[];
  environmentalRisks?: string;
  approvalsStatus?: string;
  culturalHeritageIssues?: string;
  timeline?: string;
  economicBenefits?: string;
  links: Array<{ title: string; url: string }>;
  lastUpdated: string;
  contentHtml?: string;
}

export function getSortedProjectsData(): ProjectData[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjectsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Extract data
      const data = matterResult.data as any;
      const lastUpdatedString = data.lastUpdated instanceof Date
        ? data.lastUpdated.toISOString().split('T')[0]
        : String(data.lastUpdated);

      // Combine the data with the id
      return {
        id,
        title: data.title,
        description: data.description,
        region: data.region,
        status: data.status,
        estimatedCost: data.estimatedCost,
        fundingCommitted: data.fundingCommitted,
        fundingSources: Array.isArray(data.fundingSources) ? data.fundingSources : [],
        capacity: data.capacity,
        irrigationArea: data.irrigationArea,
        location: data.location,
        organizations: Array.isArray(data.organizations) ? data.organizations : [],
        environmentalRisks: data.environmentalRisks,
        approvalsStatus: data.approvalsStatus,
        culturalHeritageIssues: data.culturalHeritageIssues,
        timeline: data.timeline,
        economicBenefits: data.economicBenefits,
        links: Array.isArray(data.links) ? data.links : [],
        lastUpdated: lastUpdatedString,
      };
    });

  // Sort projects by lastUpdated date (newest first)
  return allProjectsData.sort((a, b) => {
    if (a.lastUpdated < b.lastUpdated) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getProjectData(id: string): Promise<ProjectData> {
  const fullPath = path.join(projectsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Extract data
  const data = matterResult.data as any;
  const lastUpdatedString = data.lastUpdated instanceof Date
    ? data.lastUpdated.toISOString().split('T')[0]
    : String(data.lastUpdated);

  return {
    id,
    contentHtml,
    title: data.title,
    description: data.description,
    region: data.region,
    status: data.status,
    estimatedCost: data.estimatedCost,
    fundingCommitted: data.fundingCommitted,
    fundingSources: Array.isArray(data.fundingSources) ? data.fundingSources : [],
    capacity: data.capacity,
    irrigationArea: data.irrigationArea,
    location: data.location,
    organizations: Array.isArray(data.organizations) ? data.organizations : [],
    environmentalRisks: data.environmentalRisks,
    approvalsStatus: data.approvalsStatus,
    culturalHeritageIssues: data.culturalHeritageIssues,
    timeline: data.timeline,
    economicBenefits: data.economicBenefits,
    links: Array.isArray(data.links) ? data.links : [],
    lastUpdated: lastUpdatedString,
  };
}
