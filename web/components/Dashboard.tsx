"use client";

import { useState, useMemo } from 'react';
import { WaterAllocation, WaterPlan } from '@/lib/data';
import { ScanData } from '@/lib/scans';
import { ArticleData } from '@/lib/articles';
import { ProjectData } from '@/lib/projects';
import { UnallocatedWater } from '@/lib/unallocated';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Filter, Droplets, ArrowRightLeft, Info, Calendar, FileText, ExternalLink, Newspaper, ChevronDown, ChevronUp, Search, ArrowUpDown, BookOpen, Building2, Layers } from 'lucide-react';
import clsx from 'clsx';

interface DashboardProps {
  initialAllocations: WaterAllocation[];
  initialPlans: WaterPlan[];
  unallocatedWater: UnallocatedWater[];
  scans?: ScanData[]; // Optional - scans tab temporarily removed
  articles: ArticleData[];
  projects: ProjectData[];
}

type Tab = 'allocations' | 'unallocated' | 'plans' | 'articles' | 'projects';
// 'scans' removed temporarily - can be re-added later

export default function Dashboard({ initialAllocations, initialPlans, unallocatedWater, scans, articles, projects }: DashboardProps) {
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
              setActiveTab('unallocated');
            }}
            className={clsx(
              'whitespace-nowrap py-3 px-4 md:px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300',
              'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              'relative z-10 cursor-pointer',
              activeTab === 'unallocated'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Unallocated Water</span>
            <span className="sm:hidden">Unallocated</span>
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
          {/* Media Scans tab - temporarily removed, can be re-enabled later
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
          */}
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
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('projects');
            }}
            className={clsx(
              'whitespace-nowrap py-3 px-4 md:px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300',
              'shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              'relative z-10 cursor-pointer',
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Infrastructure Projects</span>
            <span className="sm:hidden">Projects</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'allocations' ? (
        <AllocationsView data={initialAllocations} />
      ) : activeTab === 'unallocated' ? (
        <UnallocatedWaterView data={unallocatedWater} />
      ) : activeTab === 'plans' ? (
        <PlansView data={initialPlans} />
      ) : activeTab === 'articles' ? (
        <ArticlesView articles={articles} />
      ) : (
        <ProjectsView projects={projects} />
      )}
      {/* Scans tab content - temporarily removed, can be re-enabled later
      : activeTab === 'scans' ? (
        <ScansView scans={scans} />
      )
      */}
    </div>
  );
}

// --- Sub-Components ---

function AllocationsView({ data }: { data: WaterAllocation[] }) {
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedScheme, setSelectedScheme] = useState<string>("All");
  const [selectedPriorityGroup, setSelectedPriorityGroup] = useState<string>("All");
  const [selectedZone, setSelectedZone] = useState<string>("All");

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

  const priorityGroups = useMemo(() => {
    let filtered = data;
    if (selectedArea !== "All") {
      filtered = filtered.filter(d => d['Water Area'] === selectedArea);
    }
    if (selectedScheme !== "All") {
      filtered = filtered.filter(d => d.Scheme === selectedScheme);
    }
    const unique = new Set(filtered.map(d => d['Priority Group']).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [data, selectedArea, selectedScheme]);

  const zones = useMemo(() => {
    let filtered = data;
    if (selectedArea !== "All") {
      filtered = filtered.filter(d => d['Water Area'] === selectedArea);
    }
    if (selectedScheme !== "All") {
      filtered = filtered.filter(d => d.Scheme === selectedScheme);
    }
    if (selectedPriorityGroup !== "All") {
      filtered = filtered.filter(d => d['Priority Group'] === selectedPriorityGroup);
    }
    const unique = new Set(filtered.map(d => d['Zone/Location']).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [data, selectedArea, selectedScheme, selectedPriorityGroup]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedArea !== "All" && item['Water Area'] !== selectedArea) return false;
      if (selectedScheme !== "All" && item.Scheme !== selectedScheme) return false;
      if (selectedPriorityGroup !== "All" && item['Priority Group'] !== selectedPriorityGroup) return false;
      if (selectedZone !== "All" && item['Zone/Location'] !== selectedZone) return false;
      return true;
    });
  }, [data, selectedArea, selectedScheme, selectedPriorityGroup, selectedZone]);

  // Calculate total current volume
  const totalCurrentVolume = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr['Current Volume (ML)'] || 0), 0);
  }, [filteredData]);

  // Calculate KPIs grouped by Priority Group
  const priorityGroupKpis = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const priorityGroup = curr['Priority Group'] || 'Unknown';
      if (!acc[priorityGroup]) {
        acc[priorityGroup] = 0;
      }
      acc[priorityGroup] += curr['Current Volume (ML)'] || 0;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by volume descending
    return Object.entries(grouped)
      .map(([group, volume]) => ({ group, volume }))
      .sort((a, b) => b.volume - a.volume);
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
        priorityGroup: item['Priority Group'],
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Water Area</label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 shadow-sm bg-white"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedScheme("All");
                setSelectedPriorityGroup("All");
                setSelectedZone("All");
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
              onChange={(e) => {
                setSelectedScheme(e.target.value);
                setSelectedPriorityGroup("All");
                setSelectedZone("All");
              }}
            >
              {schemes.map(scheme => (
                <option key={scheme} value={scheme}>{scheme}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Group</label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 shadow-sm bg-white"
              value={selectedPriorityGroup}
              onChange={(e) => {
                setSelectedPriorityGroup(e.target.value);
                setSelectedZone("All");
              }}
            >
              {priorityGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Zone / Location</label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 shadow-sm bg-white"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs - Total and Priority Group Volumes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Current Volume Card */}
        <Card
          title="Total Current Volume"
          value={`${totalCurrentVolume.toLocaleString(undefined, {maximumFractionDigits: 0})} ML`}
          icon={<Droplets className="w-6 h-6 text-blue-500" />}
          subtext="Total allocated volume currently held"
        />

        {/* Priority Group Cards */}
        {priorityGroupKpis.map(({ group, volume }) => {
          // Determine icon and color based on priority group
          let icon;
          let subtext = "Allocated current volume";

          if (group.toLowerCase().includes('high')) {
            icon = <Droplets className="w-6 h-6 text-red-500" />;
          } else if (group.toLowerCase().includes('medium')) {
            icon = <Droplets className="w-6 h-6 text-amber-500" />;
          } else if (group.toLowerCase().includes('unsupplemented')) {
            icon = <Droplets className="w-6 h-6 text-gray-500" />;
          } else {
            icon = <Droplets className="w-6 h-6 text-blue-500" />;
          }

          return (
            <Card
              key={group}
              title={group}
              value={`${volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ML`}
              icon={icon}
              subtext={subtext}
            />
          );
        })}
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                        <p className="font-bold text-gray-900 mb-2">{label}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-semibold">Priority Group:</span> {payload[0]?.payload?.priorityGroup || 'N/A'}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-semibold">{entry.name}:</span> {entry.value?.toLocaleString() || 0} ML
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
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

// ScansView component - temporarily removed, can be re-enabled later
/*
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
*/

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

function ProjectsView({ projects }: { projects: ProjectData[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'All' || project.region === selectedRegion;
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [projects, searchQuery, selectedRegion, selectedStatus]);

  // Get unique regions
  const regions = useMemo(() => {
    const unique = new Set(projects.map(p => p.region).filter(Boolean));
    return ['All', ...Array.from(unique).sort()];
  }, [projects]);

  // Get unique statuses
  const statuses = useMemo(() => {
    const unique = new Set(projects.map(p => p.status));
    return ['All', ...Array.from(unique).sort()];
  }, [projects]);

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'construction':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'proposed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card
          title="Total Projects"
          value={projects.length}
          icon={<Building2 className="w-6 h-6 text-emerald-600" />}
          subtext="Queensland water infrastructure projects"
        />
        <Card
          title="Water Plan Regions"
          value={regions.length - 1}
          icon={<Filter className="w-6 h-6 text-teal-600" />}
          subtext="Regions with infrastructure projects"
        />
        <Card
          title="Active/Planning"
          value={projects.filter(p => ['planning', 'construction', 'proposed'].includes(p.status)).length}
          icon={<Info className="w-6 h-6 text-blue-600" />}
          subtext="Projects in development pipeline"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by name, description, region, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Water Plan Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Info className="inline w-4 h-4 mr-1" />
                Project Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing <span className="font-semibold text-emerald-600">{filteredProjects.length}</span> of {projects.length} projects
            </span>
            {(searchQuery || selectedRegion !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('All');
                  setSelectedStatus('All');
                }}
                className="text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isExpanded = expandedId === project.id;
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Project Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{project.title}</h3>
                        <span className={clsx(
                          'px-3 py-1 rounded-full text-xs font-semibold border',
                          getStatusColor(project.status)
                        )}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{project.description}</p>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {project.region && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Region</p>
                        <p className="text-sm font-bold text-emerald-700">{project.region}</p>
                      </div>
                    )}
                    {project.capacity && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Capacity</p>
                        <p className="text-sm font-bold text-blue-700">{project.capacity}</p>
                      </div>
                    )}
                    {project.estimatedCost && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Estimated Cost</p>
                        <p className="text-sm font-bold text-purple-700">{project.estimatedCost}</p>
                      </div>
                    )}
                    {project.irrigationArea && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Irrigation Area</p>
                        <p className="text-sm font-bold text-green-700">{project.irrigationArea}</p>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl transition-all duration-200 border border-emerald-200"
                  >
                    <span className="font-semibold text-emerald-700">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-emerald-700" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 space-y-6">
                    {/* Detailed Information Sections */}
                    {project.location && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-emerald-600" />
                          Location
                        </h4>
                        <p className="text-gray-700">{project.location}</p>
                      </div>
                    )}

                    {project.fundingCommitted && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-emerald-600" />
                          Funding
                        </h4>
                        <p className="text-gray-700 mb-2"><strong>Committed:</strong> {project.fundingCommitted}</p>
                        {project.fundingSources && project.fundingSources.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Sources:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {project.fundingSources.map((source, idx) => (
                                <li key={idx}>{source}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {project.economicBenefits && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-emerald-600" />
                          Economic Benefits
                        </h4>
                        <p className="text-gray-700">{project.economicBenefits}</p>
                      </div>
                    )}

                    {project.timeline && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          Timeline
                        </h4>
                        <p className="text-gray-700">{project.timeline}</p>
                      </div>
                    )}

                    {project.approvalsStatus && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          Approvals Status
                        </h4>
                        <p className="text-gray-700">{project.approvalsStatus}</p>
                      </div>
                    )}

                    {project.environmentalRisks && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-amber-600" />
                          Environmental Considerations
                        </h4>
                        <p className="text-gray-700">{project.environmentalRisks}</p>
                      </div>
                    )}

                    {project.culturalHeritageIssues && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-amber-600" />
                          Cultural Heritage
                        </h4>
                        <p className="text-gray-700">{project.culturalHeritageIssues}</p>
                      </div>
                    )}

                    {project.organizations && project.organizations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          Key Organizations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.organizations.map((org, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200"
                            >
                              {org}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Content */}
                    {project.contentHtml && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          Detailed Information
                        </h4>
                        <div
                          className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-emerald-600 hover:prose-a:text-emerald-800 prose-strong:text-gray-900"
                          dangerouslySetInnerHTML={{ __html: project.contentHtml }}
                        />
                      </div>
                    )}

                    {/* Links */}
                    {project.links && project.links.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-emerald-600" />
                          External Resources
                        </h4>
                        <div className="space-y-2">
                          {project.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 hover:underline group"
                            >
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              <span>{link.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(project.lastUpdated).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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

// Unallocated Water View Component
function UnallocatedWaterView({ data }: { data: UnallocatedWater[] }) {
  const [selectedBasin, setSelectedBasin] = useState<string>("All");
  const [sortColumn, setSortColumn] = useState<keyof UnallocatedWater | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique basins
  const basins = useMemo(() => {
    const unique = new Set(data.map(d => d.Basin).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [data]);

  // Filter data by basin
  const filteredData = useMemo(() => {
    if (selectedBasin === "All") return data;
    return data.filter(item => item.Basin === selectedBasin);
  }, [data, selectedBasin]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Calculate total volume
  const totalVolume = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr['Reserve Volume (ML)'] || 0), 0);
  }, [filteredData]);

  // Group by purpose for chart
  const purposeData = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const purpose = curr.Purpose || 'Unknown';
      if (!acc[purpose]) {
        acc[purpose] = 0;
      }
      acc[purpose] += curr['Reserve Volume (ML)'] || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([purpose, volume]) => ({ purpose, volume }))
      .sort((a, b) => b.volume - a.volume);
  }, [filteredData]);

  // Group by basin for chart
  const basinData = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const basin = curr.Basin || 'Unknown';
      if (!acc[basin]) {
        acc[basin] = 0;
      }
      acc[basin] += curr['Reserve Volume (ML)'] || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([basin, volume]) => ({ basin, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10); // Top 10 basins
  }, [filteredData]);

  const handleSort = (column: keyof UnallocatedWater) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Colors for charts
  const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Filter className="w-5 h-5 text-violet-600 flex-shrink-0" />
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Basin</label>
            <select
              value={selectedBasin}
              onChange={(e) => setSelectedBasin(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
            >
              {basins.map(basin => (
                <option key={basin} value={basin}>{basin}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Card */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-6 md:p-8 rounded-2xl shadow-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-sm font-medium mb-2">Total Unallocated Water</p>
            <h3 className="text-4xl md:text-5xl font-bold">{totalVolume.toLocaleString()} ML</h3>
            <p className="text-violet-100 text-sm mt-2">{filteredData.length} reserves{selectedBasin !== "All" ? ` in ${selectedBasin}` : ''}</p>
          </div>
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Layers className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purpose Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-600" />
            Distribution by Purpose
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purposeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="purpose"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                formatter={(value: number) => [`${value.toLocaleString()} ML`, 'Volume']}
              />
              <Bar dataKey="volume" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Basins */}
        {selectedBasin === "All" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-violet-600" />
              Top 10 Basins
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={basinData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="basin"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [`${value.toLocaleString()} ML`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            Unallocated Water Reserves
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-violet-100 transition-colors"
                  onClick={() => handleSort('Basin')}
                >
                  <div className="flex items-center gap-2">
                    Basin
                    {sortColumn === 'Basin' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-violet-100 transition-colors"
                  onClick={() => handleSort('Location')}
                >
                  <div className="flex items-center gap-2">
                    Location
                    {sortColumn === 'Location' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-violet-100 transition-colors"
                  onClick={() => handleSort('Reserve Volume (ML)')}
                >
                  <div className="flex items-center gap-2">
                    Reserve Volume (ML)
                    {sortColumn === 'Reserve Volume (ML)' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-violet-100 transition-colors"
                  onClick={() => handleSort('Purpose')}
                >
                  <div className="flex items-center gap-2">
                    Purpose
                    {sortColumn === 'Purpose' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-violet-100 transition-colors"
                  onClick={() => handleSort('Entity held in reserve for')}
                >
                  <div className="flex items-center gap-2">
                    Entity
                    {sortColumn === 'Entity held in reserve for' && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-violet-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.Basin}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                    {item.Location}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-violet-600">
                    {(item['Reserve Volume (ML)'] || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                      {item.Purpose}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item['Entity held in reserve for']}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No unallocated water reserves found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
