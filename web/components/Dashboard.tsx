"use client";

import { useState, useMemo } from 'react';
import { WaterAllocation } from '@/lib/data';
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
import { Filter, Droplets, ArrowRightLeft, Info } from 'lucide-react';

interface DashboardProps {
  initialData: WaterAllocation[];
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedScheme, setSelectedScheme] = useState<string>("All");

  // Get unique filters
  const areas = useMemo(() => {
    const unique = new Set(initialData.map(d => d['Water Area']).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [initialData]);

  const schemes = useMemo(() => {
    let filtered = initialData;
    if (selectedArea !== "All") {
      filtered = filtered.filter(d => d['Water Area'] === selectedArea);
    }
    const unique = new Set(filtered.map(d => d.Scheme).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [initialData, selectedArea]);

  // Filter Data
  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      if (selectedArea !== "All" && item['Water Area'] !== selectedArea) return false;
      if (selectedScheme !== "All" && item.Scheme !== selectedScheme) return false;
      return true;
    });
  }, [initialData, selectedArea, selectedScheme]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      current: acc.current + (curr['Current Volume (ML)'] || 0),
      max: acc.max + (curr['Maximum Volume (ML)'] || 0),
      headroom: acc.headroom + (curr['Trading Headroom (ML)'] || 0)
    }), { current: 0, max: 0, headroom: 0 });
  }, [filteredData]);

  // Chart Data Aggregation (Group by Zone)
  const chartData = useMemo(() => {
    // Take top 20 zones by capacity to avoid overcrowding chart if "All" is selected
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
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water Area</label>
            <select 
              className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedScheme("All"); // Reset scheme when area changes
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
          trend="true"
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
    </div>
  );
}

function Card({ title, value, icon, subtext, trend }: any) {
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

