'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  Flame,
  Brain,
  Code2,
  FileText,
  UserCheck,
  Calendar,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/profiles/dashboard');
      return res.data.stats;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800 rounded-xl md:col-span-2"></div>
          <div className="h-80 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Fallback charts data
  const dsaChartData = stats?.dsa?.breakdown?.length
    ? stats.dsa.breakdown
    : [
        { topic: 'arrays', count: 4 },
        { topic: 'strings', count: 2 },
        { topic: 'trees', count: 1 },
      ];

  const aptitudeChartData = stats?.aptitude?.breakdown?.length
    ? stats.aptitude.breakdown
    : [
        { category: 'Quantitative', percentage: 70 },
        { category: 'Logical', percentage: 85 },
        { category: 'Verbal', percentage: 60 },
      ];

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#e2e8f0'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">Here is your preparation roadmap summary for today.</p>
        </div>

        {stats?.upcomingGoal && (
          <Link
            href="/planner"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 text-xs font-semibold transition-all"
          >
            <span>Next Task: {stats.upcomingGoal.title}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Streak */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="p-3.5 rounded-xl bg-orange-600/10 text-orange-400">
            <Flame className="h-6 w-6 fill-orange-500/10" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Streak</p>
            <p className="text-xl font-bold text-slate-200 mt-1">{stats?.streak || 0} Days</p>
          </div>
        </div>

        {/* Aptitude */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="p-3.5 rounded-xl bg-indigo-600/10 text-indigo-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Aptitude Avg</p>
            <p className="text-xl font-bold text-slate-200 mt-1">{stats?.aptitude?.avgScore || 0}%</p>
          </div>
        </div>

        {/* DSA Tracker */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="p-3.5 rounded-xl bg-purple-600/10 text-purple-400">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">DSA Solved</p>
            <p className="text-xl font-bold text-slate-200 mt-1">{stats?.dsa?.solved || 0} Solved</p>
          </div>
        </div>

        {/* Resume */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-800">
          <div className="p-3.5 rounded-xl bg-cyan-600/10 text-cyan-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Resume ATS Score</p>
            <p className="text-xl font-bold text-slate-200 mt-1">{stats?.resume?.score || 0}/100</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DSA Topic Chart (Double column width) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4.5 w-4.5 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-200">DSA Topic Solve-rate</h3>
            </div>
            <Link href="/dsa" className="text-xs text-indigo-400 hover:underline">View All</Link>
          </div>

          <div className="h-64 w-full">
            {dsaChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">No questions solved yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dsaChartData}>
                  <XAxis dataKey="topic" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelClassName="text-slate-400 text-xs"
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {dsaChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Aptitude categories score */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Aptitude Breakdown</h3>
            </div>
            <Link href="/aptitude" className="text-xs text-indigo-400 hover:underline">Start Quiz</Link>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {aptitudeChartData.length === 0 ? (
              <div className="text-xs text-slate-500">Attempt tests to view breakdown</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aptitudeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="percentage"
                    nameKey="category"
                  >
                    {aptitudeChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Labels */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
            {aptitudeChartData.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="h-2 w-2 rounded-full mb-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate w-full font-medium">{item.category}</span>
                <span className="font-bold text-slate-200 mt-0.5">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub-style heat activity log */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4.5 w-4.5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Weekly Performance Activity</h3>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {[...Array(14)].map((_, idx) => {
            const date = new Date();
            date.setDate(date.getDate() - (13 - idx));
            const dateStr = date.toISOString().split('T')[0];

            // Search log count
            const log = stats?.weeklyActivity?.find((w: any) => w.date === dateStr);
            const count = log ? log.count : 0;

            let bg = 'bg-slate-850';
            if (count > 0 && count <= 2) bg = 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/10';
            if (count > 2 && count <= 4) bg = 'bg-indigo-600/50 text-indigo-100 border border-indigo-500/25';
            if (count > 4) bg = 'bg-indigo-500 text-white font-bold';

            return (
              <div key={idx} className={`p-2 flex flex-col items-center rounded-lg ${bg} transition-all`}>
                <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs font-bold mt-1.5 leading-none">
                  {date.getDate()}
                </span>
                <span className="text-[9px] font-semibold text-slate-500 mt-1">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
