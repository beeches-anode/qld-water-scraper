import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export interface ArticleData {
  id: string;
  date: string;
  title: string;
  source: string;
  url: string;
  tags: string[];
  implications: string;
  contentHtml?: string;
}

export function getSortedArticlesData(): ArticleData[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Extract data and convert date to string if needed
      const data = matterResult.data as any;
      const dateString = data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
        : String(data.date);

      // Combine the data with the id
      return {
        id,
        date: dateString,
        title: data.title,
        source: data.source,
        url: data.url,
        tags: Array.isArray(data.tags) ? data.tags : [],
        implications: data.implications,
      };
    });

  // Sort articles by date (newest first)
  return allArticlesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getArticleData(id: string): Promise<ArticleData> {
  const fullPath = path.join(articlesDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Extract data and convert date to string if needed
  const data = matterResult.data as any;
  const dateString = data.date instanceof Date
    ? data.date.toISOString().split('T')[0]
    : String(data.date);

  return {
    id,
    contentHtml,
    date: dateString,
    title: data.title,
    source: data.source,
    url: data.url,
    tags: Array.isArray(data.tags) ? data.tags : [],
    implications: data.implications,
  };
}
