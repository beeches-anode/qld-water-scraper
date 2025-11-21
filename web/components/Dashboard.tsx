"use client";

import { useState, useMemo } from 'react';
import { WaterAllocation, WaterPlan } from '@/lib/data';
import { ScanData } from '@/lib/scans';
import { ArticleData } from '@/lib/articles';
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
import { Filter, Droplets, ArrowRightLeft, Info, Calendar, FileText, ExternalLink, Newspaper, ChevronDown, ChevronUp, Search, ArrowUpDown, BookOpen } from 'lucide-react';
import clsx from 'clsx';

interface DashboardProps {
  initialAllocations: WaterAllocation[];
  initialPlans: WaterPlan[];
  scans: ScanData[];
  articles: ArticleData[];
}

type Tab = 'allocations' | 'plans' | 'scans' | 'articles';

export default function Dashboard({ initialAllocations, initialPlans, scans, articles }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('allocations');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-2 rounded-2xl shadow-lg border border-gray-200/50 overflow-x-auto relative z-20">
        <nav className="flex space-x-2 min-w-max relative z-20" aria-label="Tabs">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('allocations');
            }}
            className={clsx(
              'whitespace-nowrap py-3 px-4 md:px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300',
              'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              'relative z-10 cursor-pointer',
              activeTab === 'allocations'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <Droplets className="w-4 h-4" />
            <span className="hidden sm:inline">Allocations & Trading</span>
            <span className="sm:hidden">Allocations</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('plans');
            }}
            className={clsx(
              'whitespace-nowrap py-3 px-4 md:px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300',
              'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              'relative z-10 cursor-pointer',
              activeTab === 'plans'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Water Plans</span>
            <span className="sm:hidden">Plans</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('scans');
            }}
            className={clsx(
              'whitespace-nowrap py-3 px-4 md:px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300',
              'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              'relative z-10 cursor-pointer',
              activeTab === 'scans'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <Newspaper className="w-4 h-4" />
            <span className="hidden sm:inline">Media Scans</span>
            <span className="sm:hidden">Scans</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('articles');
            }}
            className={clsx(
              'whitespace-nowrap py-3 px-4 md:px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300',
              'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              'relative z-10 cursor-pointer',
              activeTab === 'articles'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Media Articles</span>
            <span className="sm:hidden">Articles</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'allocations' ? (
        <AllocationsView data={initialAllocations} />
      ) : activeTab === 'plans' ? (
        <PlansView data={initialPlans} />
      ) : activeTab === 'scans' ? (
        <ScansView scans={scans} />
      ) : (
        <ArticlesView articles={articles} />
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
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-200/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5 text-blue-700">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
          <span className="font-bold text-base">Filter Data</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Water Area</label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 shadow-sm bg-white"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Scheme</label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 shadow-sm bg-white"
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
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="plan-search" className="block text-sm font-semibold text-gray-700 mb-3">
              Search Plans
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="plan-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, status, or expiry year..."
                className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                         focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                         text-sm placeholder-gray-400 transition-all duration-200
                         hover:border-gray-300 shadow-sm bg-white"
              />
            </div>
          </div>

          {/* Sort Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sort By
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('expiry')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  "shadow-sm hover:shadow-md transform hover:-translate-y-0.5",
                  sortBy === 'expiry'
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                )}
              >
                <Calendar className="w-4 h-4" />
                Expiry Date
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  "shadow-sm hover:shadow-md transform hover:-translate-y-0.5",
                  sortBy === 'name'
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-gray-600">
                Found <span className="font-bold text-blue-600">{filteredAndSortedData.length}</span> plan{filteredAndSortedData.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAndSortedData.length > 0 ? (
          filteredAndSortedData.map((plan, i) => (
          <div key={i} className="group bg-white p-8 rounded-2xl shadow-md border border-gray-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{plan['Plan Name']}</h3>
                <span className={clsx(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm",
                  ['2024', '2025'].some(y => String(plan['Estimated Expiry']).includes(y))
                    ? "bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-red-500/30"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30"
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  Expires: {plan['Estimated Expiry']}
                </span>
              </div>
              {plan.URL && (
                <a
                  href={plan.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold transition-all duration-200 hover:gap-3 group/link"
                >
                  View on Business QLD
                  <ExternalLink className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                </a>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-l-4 border-blue-500 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-900 mb-2 text-sm">Status Update</p>
                  <p className="text-sm text-blue-900 leading-relaxed">{plan['Status Summary']}</p>
                </div>
              </div>
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

      <div className="space-y-6">
        {scans.map((scan) => (
          <div key={scan.id} className="group bg-white rounded-2xl shadow-md border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-purple-200 transition-all duration-300">
             <button
              onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
              className="w-full flex items-center justify-between p-8 text-left hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
             >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30">
                      <Calendar className="w-3.5 h-3.5" />
                      {scan.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{scan.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{scan.description}</p>
                </div>
                <div className="ml-4 p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  {expandedId === scan.id ? (
                    <ChevronUp className="w-6 h-6 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-purple-600" />
                  )}
                </div>
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

function ArticlesView({ articles }: { articles: ArticleData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // Get all unique tags from articles, sorted by frequency
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    articles.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Sort by frequency (descending), then alphabetically
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]; // Sort by count descending
        return a[0].localeCompare(b[0]); // Then alphabetically
      })
      .map(([tag]) => tag);

    return ["All", ...sortedTags];
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Tag filter
      if (selectedTag !== "All" && !article.tags.includes(selectedTag)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          article.implications.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [articles, searchQuery, selectedTag]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Articles"
          value={articles.length.toString()}
          icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
          subtext="Media articles tracked"
        />
        <Card
          title="Latest Article"
          value={articles[0]?.date || "N/A"}
          icon={<Calendar className="w-6 h-6 text-blue-500" />}
          subtext={articles[0]?.source || "No articles yet"}
        />
        <Card
          title="Sources"
          value={new Set(articles.map(a => a.source)).size.toString()}
          icon={<Newspaper className="w-6 h-6 text-purple-500" />}
          subtext="Unique media sources"
        />
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col gap-6">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="article-search" className="block text-sm font-semibold text-gray-700 mb-3">
              Search Articles
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                id="article-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, source, tags, or implications..."
                className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                         focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
                         text-sm placeholder-gray-400 transition-all duration-200
                         hover:border-gray-300 shadow-sm"
              />
            </div>
          </div>

          {/* Tag Filter Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Filter by Tag
            </label>
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                {(tagsExpanded ? allTags : allTags.slice(0, 13)).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={clsx(
                      "px-4 py-2 rounded-full font-medium text-xs transition-all duration-200 whitespace-nowrap",
                      "shadow-sm hover:shadow-md transform hover:-translate-y-0.5",
                      selectedTag === tag
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Expand/Collapse Button */}
              {allTags.length > 13 && (
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {tagsExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show all tags ({allTags.length - 1})</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Count */}
        {(searchQuery || selectedTag !== "All") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-gray-600">
                Found <span className="font-bold text-indigo-600">{filteredArticles.length}</span> article{filteredArticles.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedTag !== "All" && ` with tag "${selectedTag}"`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-8">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article.id} className="group bg-white p-8 rounded-2xl shadow-md border border-gray-200/50 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
              {/* Header */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                      <Newspaper className="w-3 h-3" />
                      {article.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {article.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200 hover:from-indigo-500 hover:to-purple-600 hover:text-white cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-3 group/link"
                  >
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 group-hover/link:from-indigo-600 group-hover/link:to-purple-600 bg-clip-text text-transparent">
                      {article.title}
                    </span>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover/link:text-indigo-600 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all" />
                  </a>
                </div>
              </div>

              {/* Summary (if content exists) */}
              {article.contentHtml && (
                <div className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
                  <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {articles.length === 0 ? "No Articles Yet" : "No articles found"}
            </h3>
            <p className="text-gray-500 mt-2">
              {articles.length === 0
                ? "Add article markdown files to content/articles to see them here."
                : searchQuery || selectedTag !== "All"
                ? "Try adjusting your search or filter criteria."
                : "No articles available."
              }
            </p>
            {(searchQuery || selectedTag !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("All");
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon, subtext }: any) {
  return (
    <div className="group relative bg-gradient-to-br from-white via-gray-50 to-white p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
          <h4 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{value}</h4>
        </div>
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="relative mt-auto">
        <p className="text-xs text-gray-600 leading-relaxed">{subtext}</p>
      </div>
    </div>
  );
}
