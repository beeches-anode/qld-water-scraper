import { fetchWaterAllocations } from '@/lib/data';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const data = await fetchWaterAllocations();

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
        <Dashboard initialData={data} />
        </div>
      </main>
  );
}
