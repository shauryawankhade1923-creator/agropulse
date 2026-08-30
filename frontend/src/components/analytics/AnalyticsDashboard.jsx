import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Scale, 
  ShieldCheck, 
  Building2,
  Download
} from 'lucide-react';
import { api } from '../../api';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.getAnalyticsSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        Loading APMC analytics data...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operations Telemetry
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              APMC Mandi Intelligence Dashboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live throughput, DBT settlement volume, and regional price trajectories.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800 flex items-center space-x-2 transition self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Procured Tonnage</span>
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(data.total_procured_kg / 1000).toFixed(1)} MT
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            +18.4% seasonal growth
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">DBT Disbursed</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{(data.total_payments_disbursed / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Direct to Kisan bank accounts
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg. Gate Wait</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {data.avg_waiting_time_minutes} mins
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            -64% reduction with QR Tokens
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Farmers</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {data.total_farmers_active}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across 4 state mandis
          </span>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Price Trends Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Mandi Spot Price Trends (₹/kg)</h3>
              <p className="text-[11px] text-slate-500">7-day arrival spot price trajectory</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.price_trends_7d}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="Onion" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Wheat" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Soybean" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mandi Yard Performance Table (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Mandi Efficiency Ranking</h3>
              <Building2 className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-3">
              {data.mandi_performance.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-slate-200">{m.name}</strong>
                    <span className="text-emerald-400 font-mono font-medium">{m.efficiency}% Efficiency</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Volume: {m.throughput_tons} MT</span>
                    <span>Avg Wait: {m.avg_wait_min} min</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${m.efficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 mt-4">
            Summary: Real-time load balancing between Nashik and Lasalgaon has reduced peak wait times by 45 minutes.
          </div>
        </div>

      </div>

    </div>
  );
}
