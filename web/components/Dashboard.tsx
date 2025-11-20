"use client";

import { useState, useMemo } from 'react';
import { WaterAllocation, WaterPlan } from '@/lib/data';
import { ScanData } from '@/lib/scans';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Filter, Droplets, ArrowRightLeft, Info, Calendar, FileText, ExternalLink, Newspaper, ChevronDown, ChevronUp, Search, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';

interface DashboardProps {
  initialAllocations: WaterAllocation[];
  initialPlans: WaterPlan[];
  scans: ScanData[];
}

type Tab = 'allocations' | 'plans' | 'scans';

export default function Dashboard({ initialAllocations, initialPlans, scans }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('allocations');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max md:min-w-0" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('allocations')}
            className={clsx(
              activeTab === 'allocations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1.5 md:gap-2'
            )}
          >
            <Droplets className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Allocations & Trading</span>
            <span className="sm:hidden">Allocations</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={clsx(
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
            )}
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Water Plans</span>
            <span className="sm:hidden">Plans</span>
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={clsx(
              activeTab === 'scans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
            )}
          >
            <Newspaper className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Media Scans</span>
            <span className="sm:hidden">Scans</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'allocations' ? (
        <AllocationsView data={initialAllocations} />
      ) : activeTab === 'plans' ? (
        <PlansView data={initialPlans} />
      ) : (
        <ScansView scans={scans} />
      )}
    </div>
  );
}

// --- Sub-Components ---

function AllocationsView({ data }: { data: WaterAllocation[] }) {
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedScheme, setSelectedScheme] = useState<string>("All");

  // Get unique filters
  const areas = useMemo(() => {
    const unique = new Set(data.map(d => d['Water Area']).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [data]);

  const schemes = useMemo(() => {
    let filtered = data;
    if (selectedArea !== "All") {
      filtered = filtered.filter(d => d['Water Area'] === selectedArea);
    }
    const unique = new Set(filtered.map(d => d.Scheme).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [data, selectedArea]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedArea !== "All" && item['Water Area'] !== selectedArea) return false;
      if (selectedScheme !== "All" && item.Scheme !== selectedScheme) return false;
      return true;
    });
  }, [data, selectedArea, selectedScheme]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      current: acc.current + (curr['Current Volume (ML)'] || 0),
      max: acc.max + (curr['Maximum Volume (ML)'] || 0),
      headroom: acc.headroom + (curr['Trading Headroom (ML)'] || 0)
    }), { current: 0, max: 0, headroom: 0 });
  }, [filteredData]);

  // Chart Data Aggregation
  const chartData = useMemo(() => {
    return filteredData
      .sort((a, b) => (b['Maximum Volume (ML)'] || 0) - (a['Maximum Volume (ML)'] || 0))
      .slice(0, 20)
      .map(item => ({
        name: item['Zone/Location'],
        Current: item['Current Volume (ML)'],
        Headroom: item['Trading Headroom (ML)'],
      }));
  }, [filteredData]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3 md:mb-4 text-gray-500">
          <Filter className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium text-sm md:text-base">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water Area</label>
            <select 
              className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedScheme("All");
              }}
            >
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheme</label>
            <select 
              className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
            >
              {schemes.map(scheme => (
                <option key={scheme} value={scheme}>{scheme}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Current Volume" 
          value={`${kpis.current.toLocaleString(undefined, {maximumFractionDigits: 0})} ML`}
          icon={<Droplets className="w-6 h-6 text-blue-500" />}
          subtext="Total allocated volume currently held"
        />
        <Card 
          title="Max Capacity" 
          value={`${kpis.max.toLocaleString(undefined, {maximumFractionDigits: 0})} ML`}
          icon={<Info className="w-6 h-6 text-gray-500" />}
          subtext="Total nominal volume limit"
        />
        <Card 
          title="Trading Headroom" 
          value={`${kpis.headroom.toLocaleString(undefined, {maximumFractionDigits: 0})} ML`}
          icon={<ArrowRightLeft className="w-6 h-6 text-green-500" />}
          subtext="Volume available for trading IN"
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Volume by Zone (Top 20)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={100} 
                tick={{fontSize: 12}}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="Current" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Headroom" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Allocation Data</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Scroll horizontally to view all columns →</p>
        </div>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-xs md:text-sm text-left min-w-[640px]">
            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 md:static">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3">Zone / Location</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Priority Group</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-right">Current (ML)</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-right">Max (ML)</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-right">Headroom (ML)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 md:px-6 py-2 md:py-3 font-medium text-gray-900">{item['Zone/Location']}</td>
                  <td className="px-3 md:px-6 py-2 md:py-3 text-gray-500">{item['Priority Group']}</td>
                  <td className="px-3 md:px-6 py-2 md:py-3 text-right text-blue-600">
                    {(item['Current Volume (ML)'] || 0).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-3 text-right text-gray-500">
                    {(item['Maximum Volume (ML)'] || 0).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-3 text-right font-medium text-green-600">
                    {(item['Trading Headroom (ML)'] || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No data found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlansView({ data }: { data: WaterPlan[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'expiry' | 'name'>('expiry');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First, filter by search query
    let filtered = data;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = data.filter(plan =>
        plan['Plan Name'].toLowerCase().includes(query) ||
        plan['Status Summary'].toLowerCase().includes(query) ||
        plan['Estimated Expiry'].toLowerCase().includes(query)
      );
    }

    // Then, sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'expiry') {
        const yearA = parseInt(a['Estimated Expiry']) || 9999;
        const yearB = parseInt(b['Estimated Expiry']) || 9999;

        // If years are different, sort by year
        if (yearA !== yearB) {
          return yearA - yearB;
        }

        // If years are the same, fall back to alphabetical by name
        return a['Plan Name'].localeCompare(b['Plan Name']);
      } else {
        // Sort alphabetically by name
        return a['Plan Name'].localeCompare(b['Plan Name']);
      }
    });
  }, [data, searchQuery, sortBy]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Plans" 
          value={data.length.toString()}
          icon={<FileText className="w-6 h-6 text-blue-500" />}
          subtext="Active water plans tracked"
        />
        <Card
          title="Expiring Soon"
          value={data.filter(p => ['2025', '2026'].some(y => String(p['Estimated Expiry']).includes(y))).length.toString()}
          icon={<Calendar className="w-6 h-6 text-orange-500" />}
          subtext="Expiring in 2025-2026"
        />
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="plan-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Plans
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="plan-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, status, or expiry year..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm placeholder-gray-400"
              />
            </div>
          </div>

          {/* Sort Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('expiry')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors",
                  sortBy === 'expiry'
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <Calendar className="w-4 h-4" />
                Expiry Date
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors",
                  sortBy === 'name'
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <ArrowUpDown className="w-4 h-4" />
                Name (A-Z)
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            Found <span className="font-semibold">{filteredAndSortedData.length}</span> plan{filteredAndSortedData.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAndSortedData.length > 0 ? (
          filteredAndSortedData.map((plan, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{plan['Plan Name']}</h3>
                <span className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2",
                  ['2024', '2025'].some(y => String(plan['Estimated Expiry']).includes(y)) 
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                )}>
                  Expires: {plan['Estimated Expiry']}
                </span>
              </div>
              {plan.URL && (
                <a 
                  href={plan.URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View on Business QLD
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
               <p className="font-semibold text-gray-900 mb-1">Status Update:</p>
               {plan['Status Summary']}
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No plans found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery
                ? `No plans match "${searchQuery}". Try a different search term.`
                : "No water plans available."
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScansView({ scans }: { scans: ScanData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(scans[0]?.id || null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Latest Scan" 
          value={scans[0]?.date || "N/A"}
          icon={<Newspaper className="w-6 h-6 text-purple-500" />}
          subtext={scans[0]?.title || "No scans available"}
        />
      </div>

      <div className="space-y-4">
        {scans.map((scan) => (
          <div key={scan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <button 
              onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
             >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                      {scan.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{scan.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{scan.description}</p>
                </div>
                {expandedId === scan.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
             </button>
             
             {expandedId === scan.id && scan.contentHtml && (
               <div className="bg-gray-50/50 p-4 md:p-8 border-t border-gray-200">
                 <article
                   className="prose prose-slate prose-sm md:prose-base max-w-none
                     prose-headings:font-bold prose-headings:tracking-tight

                     prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-6 md:prose-h2:mt-8
                     prose-h2:mb-4 md:prose-h2:mb-6 prose-h2:pb-2 md:prose-h2:pb-3
                     prose-h2:border-b-2 prose-h2:border-gray-300 prose-h2:text-gray-900
                     prose-h2:first:mt-0

                     prose-h3:text-base md:prose-h3:text-xl prose-h3:mt-6 md:prose-h3:mt-8
                     prose-h3:mb-3 md:prose-h3:mb-4 prose-h3:text-blue-900
                     prose-h3:bg-blue-50 prose-h3:px-3 md:prose-h3:px-4
                     prose-h3:py-1.5 md:prose-h3:py-2 prose-h3:rounded-lg
                     prose-h3:border-l-4 prose-h3:border-blue-500

                     prose-p:text-sm md:prose-p:text-base prose-p:text-gray-700
                     prose-p:leading-relaxed prose-p:mb-3 md:prose-p:mb-4

                     prose-ul:my-4 md:prose-ul:my-6 prose-ul:space-y-4 md:prose-ul:space-y-6
                     prose-li:text-gray-700 prose-li:leading-relaxed prose-li:text-sm md:prose-li:text-base
                     prose-li:bg-white prose-li:p-3 md:prose-li:p-4 prose-li:rounded-lg
                     prose-li:border prose-li:border-gray-200 prose-li:shadow-sm

                     prose-strong:text-gray-900 prose-strong:font-semibold
                     prose-strong:text-xs md:prose-strong:text-sm

                     prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline
                     prose-a:wrap-break-word hover:prose-a:underline hover:prose-a:text-blue-800

                     prose-blockquote:border-l-4 prose-blockquote:border-purple-400
                     prose-blockquote:bg-purple-50 prose-blockquote:pl-4 md:prose-blockquote:pl-6
                     prose-blockquote:pr-3 md:prose-blockquote:pr-4
                     prose-blockquote:py-3 md:prose-blockquote:py-4
                     prose-blockquote:italic prose-blockquote:rounded-r-lg
                     prose-blockquote:text-sm md:prose-blockquote:text-base

                     prose-hr:my-6 md:prose-hr:my-8 prose-hr:border-gray-300"
                   dangerouslySetInnerHTML={{ __html: scan.contentHtml }}
                 />
               </div>
             )}
          </div>
        ))}
        {scans.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Media Scans Found</h3>
            <p className="text-gray-500">Upload markdown files to content/scans to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon, subtext }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <p className="text-xs text-gray-500">{subtext}</p>
      </div>
    </div>
  );
}
