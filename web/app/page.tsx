import { fetchWaterAllocations, fetchWaterPlans } from '@/lib/data';
import { getSortedScansData, getScanData } from '@/lib/scans';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const [allocations, plans] = await Promise.all([
    fetchWaterAllocations(),
    fetchWaterPlans()
  ]);
  
  const scansList = getSortedScansData();
  
  // Pre-fetch content for all scans (since it's a small blog)
  // In a larger app, you'd fetch content on demand via API or separate page
  const scansWithContent = await Promise.all(
    scansList.map(scan => getScanData(scan.id))
  );

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <h1 className="text-2xl font-bold text-gray-900">QLD Water Markets</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard 
          initialAllocations={allocations} 
          initialPlans={plans}
          scans={scansWithContent}
        />
      </div>
    </main>
  );
}
