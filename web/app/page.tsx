import { fetchWaterAllocations, fetchWaterPlans } from '@/lib/data';
// Scans temporarily disabled - can be re-enabled later
// import { getSortedScansData, getScanData } from '@/lib/scans';
import { getSortedArticlesData, getArticleData } from '@/lib/articles';
import { getSortedProjectsData, getProjectData } from '@/lib/projects';
import { getUnallocatedWater } from '@/lib/unallocated';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';

export default async function Home() {
  const [allocations, plans, unallocatedWater] = await Promise.all([
    fetchWaterAllocations(),
    fetchWaterPlans(),
    getUnallocatedWater()
  ]);

  // Scans temporarily disabled - can be re-enabled later
  // const scansList = getSortedScansData();
  const articlesList = getSortedArticlesData();
  const projectsList = getSortedProjectsData();

  // Pre-fetch content for all scans (since it's a small blog)
  // In a larger app, you'd fetch content on demand via API or separate page
  // const scansWithContent = await Promise.all(
  //   scansList.map(scan => getScanData(scan.id))
  // );
  const scansWithContent: any[] = []; // Empty array while scans are disabled

  // Pre-fetch content for all articles
  const articlesWithContent = await Promise.all(
    articlesList.map(article => getArticleData(article.id))
  );

  // Pre-fetch content for all projects
  const projectsWithContent = await Promise.all(
    projectsList.map(project => getProjectData(project.id))
  );

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        <Dashboard
          initialAllocations={allocations}
          initialPlans={plans}
          unallocatedWater={unallocatedWater}
          // scans={scansWithContent} // Temporarily disabled
          articles={articlesWithContent}
          projects={projectsWithContent}
        />
      </div>
    </main>
  );
}
