'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, History } from 'lucide-react';

export default function ResumePage() {
  const queryClient = useQueryClient();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'strengths' | 'weaknesses' | 'suggestions' | 'skills'>('strengths');

  // Fetch past analyzes
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['resumeHistory'],
    queryFn: async () => {
      const res = await api.get('/resumes/history');
      if (res.data.success && res.data.history.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(res.data.history[0]);
      }
      return res.data.history;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/resumes/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.analysis;
    },
    onSuccess: (newAnalysis) => {
      queryClient.invalidateQueries({ queryKey: ['resumeHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      fetchProfile();
      setSelectedAnalysis(newAnalysis);
      setFile(null);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to analyze resume. Ensure the PDF contains selectable text.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      setError('Only PDF documents are supported');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit');
      return;
    }

    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* LEFT: Uploader & History */}
      <div className="space-y-6 lg:col-span-1">
        {/* Upload Container */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            <span>AI Resume Optimizer</span>
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Upload your resume PDF. Gemini AI will evaluate it against industry ATS filters and identify missing keywords.
          </p>

          <div className="border border-dashed border-slate-800 bg-slate-900/40 rounded-xl p-6 text-center relative hover:bg-slate-900/60 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">
              {file ? file.name : 'Choose PDF file'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">PDF file up to 5MB</p>
          </div>

          {error && (
            <p className="text-[10px] font-semibold text-red-400 text-center">{error}</p>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
            >
              {uploadMutation.isPending ? 'Analyzing with AI...' : 'Optimize Resume'}
            </button>
          )}
        </div>

        {/* History Panel */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <History className="h-4.5 w-4.5 text-slate-400" />
            <span>Analysis History</span>
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-850">
            {historyLoading ? (
              <p className="text-xs text-slate-500 p-2 text-center">Loading history...</p>
            ) : historyRes?.length === 0 ? (
              <p className="text-xs text-slate-500 p-2 text-center">No uploads logged yet</p>
            ) : (
              historyRes?.map((h: any) => (
                <button
                  key={h._id}
                  onClick={() => setSelectedAnalysis(h)}
                  className={`w-full text-left py-2.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedAnalysis?._id === h._id ? 'bg-slate-800/50' : 'hover:bg-slate-850/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="h-4.5 w-4.5 text-slate-500 flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-300 truncate leading-none">{h.fileName}</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-1">
                        {new Date(h.analyzedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {h.atsScore}%
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Results Display Details */}
      <div className="lg:col-span-2 space-y-6">
        {uploadMutation.isPending && (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <h4 className="text-sm font-bold text-slate-200">Uploading and Parsing PDF Content...</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              We extract text and use Gemini AI to measure grammar metrics, layout structure, and matching tech keywords.
            </p>
          </div>
        )}

        {!uploadMutation.isPending && !selectedAnalysis && (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <FileText className="h-12 w-12 text-slate-650 mx-auto" />
            <h4 className="text-sm font-bold text-slate-350">No resume analyzed yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select or upload a PDF resume on the left panel to review layout structures and ATS ratings.
            </p>
          </div>
        )}

        {!uploadMutation.isPending && selectedAnalysis && (
          <div className="space-y-6">
            {/* Score Showcase */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative h-24 w-24 flex items-center justify-center">
                {/* Radial progress ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#6366f1"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * selectedAnalysis.atsScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-slate-100">
                  {selectedAnalysis.atsScore}
                </span>
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <h4 className="text-md font-bold text-slate-200">{selectedAnalysis.fileName}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ATS score computed by Gemini AI based on common recruiter checkpoints. Strengths are marked green, weaknesses are flagged for correction.
                </p>
              </div>
            </div>

            {/* Recommendations Tabs */}
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
              {/* Tab options */}
              <div className="flex border-b border-slate-850 bg-slate-900/30">
                {[
                  { id: 'strengths', label: 'Strengths', icon: CheckCircle2 },
                  { id: 'weaknesses', label: 'Weaknesses', icon: AlertTriangle },
                  { id: 'suggestions', label: 'Suggestions', icon: HelpCircle },
                  { id: 'skills', label: 'Skill Gap', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-3 text-xs font-semibold border-b-2 transition-all ${
                        isActive
                          ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab details content */}
              <div className="p-6">
                {activeTab === 'strengths' && (
                  <ul className="space-y-3">
                    {selectedAnalysis.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'weaknesses' && (
                  <ul className="space-y-3">
                    {selectedAnalysis.weaknesses?.map((wk: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{wk}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'suggestions' && (
                  <ul className="space-y-3">
                    {selectedAnalysis.improvementSuggestions?.map((sug: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{sug}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Identified Missing Industry Keywords & Skillsets
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.skillGap?.map((sk: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
