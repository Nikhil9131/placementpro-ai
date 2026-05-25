'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Map, Clock, HelpCircle, ExternalLink, Library, CircleCheck, CheckCircle } from 'lucide-react';

export default function RoadmapsPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>('Amazon');

  const { data: roadmapRes, isLoading } = useQuery({
    queryKey: ['companyRoadmap', selectedCompany],
    queryFn: async () => {
      const res = await api.get(`/roadmaps/${selectedCompany}`);
      return res.data.roadmap;
    },
  });

  const companiesList = [
    { name: 'Amazon', type: 'product' },
    { name: 'Microsoft', type: 'product' },
    { name: 'Google', type: 'product' },
    { name: 'TCS', type: 'service' },
    { name: 'Infosys', type: 'service' },
    { name: 'Wipro', type: 'service' },
    { name: 'Accenture', type: 'service' },
    { name: 'Cognizant', type: 'service' },
    { name: 'Capgemini', type: 'service' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 1. Left selection panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Map className="h-4.5 w-4.5 text-indigo-400" />
            <span>Select Target Company</span>
          </h3>

          <div className="flex flex-col space-y-1">
            {companiesList.map((company) => (
              <button
                key={company.name}
                onClick={() => setSelectedCompany(company.name)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  selectedCompany === company.name
                    ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-bold'
                    : 'text-slate-400 hover:bg-slate-850/40 hover:text-slate-200'
                }`}
              >
                <span>{company.name}</span>
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                    company.type === 'product'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}
                >
                  {company.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Right Interactive Roadmap details view */}
      <div className="lg:col-span-3 space-y-6">
        {isLoading ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center animate-pulse">
            <div className="h-8 w-48 bg-slate-800 rounded mx-auto mb-3"></div>
            <div className="h-4 w-64 bg-slate-800 rounded mx-auto"></div>
          </div>
        ) : (
          roadmapRes && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/10">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
                    <span>{roadmapRes.companyName} Preparation Guide</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive study roadmap structured for interviews, DSA rounds, and aptitude evaluations.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                  <Clock className="h-4 w-4" />
                  <span>Timeline: {roadmapRes.estimatedTimeline}</span>
                </div>
              </div>

              {/* Core Nodes Trees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Node A: Aptitude & Topics */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-850">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-200">Aptitude Core Focus</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {roadmapRes.aptitudeTopics?.map((topic: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2.5 text-xs text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Node B: DSA Core Focus */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-850">
                    <CheckCircle className="h-4.5 w-4.5 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-200">DSA Core Focus</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {roadmapRes.dsaTopics?.map((topic: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2.5 text-xs text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0"></span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Node C: Interview Questions */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-850">
                    <HelpCircle className="h-4.5 w-4.5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-slate-200">Target Interview Scenarios</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {roadmapRes.interviewQuestions?.map((q: string, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed">
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources list */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-850">
                    <Library className="h-4.5 w-4.5 text-green-400" />
                    <h3 className="text-sm font-bold text-slate-200">Recommended Reference Resources</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {roadmapRes.resources?.map((res: any, idx: number) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 rounded-xl border border-slate-850 bg-slate-900/40 hover:bg-slate-850/30 flex items-center justify-between text-xs text-slate-300 group transition-all"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-200 truncate group-hover:text-indigo-400">{res.title}</p>
                          <span className="text-[9px] uppercase font-bold text-slate-500">{res.type}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-650 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
