import { fetchWaterAllocations, fetchWaterPlans } from '@/lib/data';
import { getSortedScansData, getScanData } from '@/lib/scans';
import { getSortedArticlesData, getArticleData } from '@/lib/articles';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const [allocations, plans] = await Promise.all([
    fetchWaterAllocations(),
    fetchWaterPlans()
  ]);

  const scansList = getSortedScansData();
  const articlesList = getSortedArticlesData();

  // Pre-fetch content for all scans (since it's a small blog)
  // In a larger app, you'd fetch content on demand via API or separate page
  const scansWithContent = await Promise.all(
    scansList.map(scan => getScanData(scan.id))
  );

  // Pre-fetch content for all articles
  const articlesWithContent = await Promise.all(
    articlesList.map(article => getArticleData(article.id))
  );

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 md:static bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 border-b-4 border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* AI Disclaimer */}
          <div className="mb-4 md:mb-6 flex items-start gap-2 bg-amber-300/90 backdrop-blur-sm border-l-4 border-amber-600 rounded-r-xl px-3 py-2 shadow-lg">
            <svg className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              <span className="font-bold">AI-Generated Content:</span> This information is automatically generated using artificial intelligence and has not been verified. Do not rely on this content for decision-making without independent verification.
            </p>
          </div>

          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-5">
              {/* Water droplet icon with enhanced styling */}
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-400/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-3 md:p-4 rounded-3xl shadow-2xl border-2 border-cyan-300/50 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    <circle cx="12" cy="14" r="4" opacity="0.7"/>
                  </svg>
                </div>
              </div>

              <div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-cyan-200 tracking-tight leading-tight">
                  Queensland Water Industry
                </h1>
                <p className="text-base md:text-xl text-cyan-300 font-semibold mt-1 tracking-wide">
                  Information Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Subtitle/Description */}
          <div className="mt-4 md:mt-6 flex items-start gap-3">
            <div className="hidden sm:block w-1 h-12 bg-gradient-to-b from-cyan-400 to-transparent rounded-full"></div>
            <p className="text-sm md:text-base text-slate-200 max-w-3xl leading-relaxed">
              Tracking water allocations, trading activity, regulatory plans, and industry developments across Queensland's bulk water supply network.
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        <Dashboard
          initialAllocations={allocations}
          initialPlans={plans}
          scans={scansWithContent}
          articles={articlesWithContent}
        />
      </div>
    </main>
  );
}
