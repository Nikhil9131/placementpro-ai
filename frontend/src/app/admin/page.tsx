'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { ShieldCheck, BarChart, Users, FileText, CheckCircle, Brain, Code2, Plus } from 'lucide-react';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'users' | 'aptitude' | 'dsa'>('metrics');

  // Form State Aptitude
  const [aptCategory, setAptCategory] = useState<string>('quantitative');
  const [aptText, setAptText] = useState<string>('');
  const [aptOptions, setAptOptions] = useState<string>('');
  const [aptCorrectIndex, setAptCorrectIndex] = useState<number>(0);
  const [aptExplanation, setAptExplanation] = useState<string>('');
  const [aptDifficulty, setAptDifficulty] = useState<string>('medium');

  // Form State DSA
  const [dsaTitle, setDsaTitle] = useState<string>('');
  const [dsaTopic, setDsaTopic] = useState<string>('arrays');
  const [dsaDifficulty, setDsaDifficulty] = useState<string>('medium');
  const [dsaDesc, setDsaDesc] = useState<string>('');
  const [dsaConstraints, setDsaConstraints] = useState<string>('');
  const [dsaCompanies, setDsaCompanies] = useState<string>('');
  const [dsaSolUrl, setDsaSolUrl] = useState<string>('');

  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Fetch metrics
  const { data: analyticsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await api.get('/admin/analytics');
      return res.data.analytics;
    },
    enabled: activeSubTab === 'metrics',
  });

  // Fetch users list
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users;
    },
    enabled: activeSubTab === 'users',
  });

  // Mutate Aptitude Question
  const addAptQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/aptitude', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setMessage({ text: data.message || 'Aptitude question added successfully', error: false });
      setAptText('');
      setAptOptions('');
      setAptExplanation('');
      setAptCorrectIndex(0);
    },
    onError: (err: any) => {
      setMessage({ text: err.response?.data?.message || 'Failed to add question', error: true });
    },
  });

  // Mutate DSA Question
  const addDsaQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/dsa', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setMessage({ text: data.message || 'DSA question added successfully', error: false });
      setDsaTitle('');
      setDsaDesc('');
      setDsaConstraints('');
      setDsaCompanies('');
      setDsaSolUrl('');
    },
    onError: (err: any) => {
      setMessage({ text: err.response?.data?.message || 'Failed to add question', error: true });
    },
  });

  const handleAddAptitude = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const optionsArray = aptOptions.split(',').map((o) => o.trim()).filter((o) => o.length > 0);

    if (optionsArray.length < 2) {
      setMessage({ text: 'At least 2 options required, separated by commas.', error: true });
      return;
    }

    addAptQuestionMutation.mutate({
      category: aptCategory,
      questionText: aptText,
      options: optionsArray,
      correctAnswerIndex: Number(aptCorrectIndex),
      explanation: aptExplanation,
      difficulty: aptDifficulty,
    });
  };

  const handleAddDsa = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const companiesArray = dsaCompanies.split(',').map((c) => c.trim()).filter((c) => c.length > 0);

    addDsaQuestionMutation.mutate({
      title: dsaTitle,
      topic: dsaTopic,
      difficulty: dsaDifficulty,
      description: dsaDesc,
      constraints: dsaConstraints,
      companyTags: companiesArray,
      solutionUrl: dsaSolUrl,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab controls */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'metrics', label: 'Platform Stats', icon: BarChart },
          { id: 'users', label: 'User Log', icon: Users },
          { id: 'aptitude', label: 'Add Aptitude', icon: Brain },
          { id: 'dsa', label: 'Add DSA Problem', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setMessage(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeSubTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-semibold max-w-xl mx-auto text-center ${
            message.error
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-green-500/10 border-green-500/20 text-green-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* SUBTAB 1: Metrics display */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-indigo-600/10 text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Registered Students</p>
                <p className="text-xl font-bold text-slate-200 mt-1">
                  {statsLoading ? '...' : analyticsRes?.users || 0}
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-purple-600/10 text-purple-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Resumes Analyzed</p>
                <p className="text-xl font-bold text-slate-200 mt-1">
                  {statsLoading ? '...' : analyticsRes?.resumesAnalyzed || 0}
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-cyan-600/10 text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Interviews Completed</p>
                <p className="text-xl font-bold text-slate-200 mt-1">
                  {statsLoading ? '...' : analyticsRes?.interviewsCompleted || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Aggregated analytical details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most solved */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Most Solved DSA Tracker</h3>
              <div className="divide-y divide-slate-850">
                {statsLoading ? (
                  <p className="text-xs text-slate-500 p-2">Loading statistics...</p>
                ) : analyticsRes?.mostSolvedDsa?.length === 0 ? (
                  <p className="text-xs text-slate-500 p-2">No solved question entries recorded yet</p>
                ) : (
                  analyticsRes?.mostSolvedDsa?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-350">{item.title}</p>
                        <p className="text-[9px] text-slate-500 capitalize">{item.topic}</p>
                      </div>
                      <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-[10px]">
                        Solved {item.count} Times
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Average mock results */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Avg Candidate Mock Performance</h3>
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Technical Score', value: Math.round(analyticsRes?.avgInterviewScores?.avgTech || 0) },
                  { label: 'Communication Score', value: Math.round(analyticsRes?.avgInterviewScores?.avgComm || 0) },
                  { label: 'Final Core Score', value: Math.round(analyticsRes?.avgInterviewScores?.avgFinal || 0) },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-200">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Users Logs list */}
      {activeSubTab === 'users' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-850 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-350">
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">Loading student directories...</td>
                </tr>
              ) : usersRes?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">No student users found</td>
                </tr>
              ) : (
                usersRes?.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{u.username}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-indigo-400">{u.role}</td>
                    <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 3: Add Aptitude Question */}
      {activeSubTab === 'aptitude' && (
        <div className="max-w-xl mx-auto glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-850 flex items-center space-x-1.5">
            <Plus className="h-4.5 w-4.5" /> <span>Add New Aptitude practice item</span>
          </h3>

          <form onSubmit={handleAddAptitude} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Category</label>
                <select
                  value={aptCategory}
                  onChange={(e) => setAptCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none"
                >
                  <option value="quantitative">Quantitative</option>
                  <option value="logical">Logical Reasoning</option>
                  <option value="verbal">Verbal Ability</option>
                  <option value="data_interpretation">Data Interpretation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Difficulty</label>
                <select
                  value={aptDifficulty}
                  onChange={(e) => setAptDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Question Prompt Text</label>
              <textarea
                rows={3}
                required
                value={aptText}
                onChange={(e) => setAptText(e.target.value)}
                placeholder="Write the question scenario here..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none resize-none"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Options (Separated by commas)</label>
              <input
                type="text"
                required
                value={aptOptions}
                onChange={(e) => setAptOptions(e.target.value)}
                placeholder="Option A, Option B, Option C, Option D"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Correct Option Index (0-3)</label>
              <input
                type="number"
                required
                min={0}
                max={3}
                value={aptCorrectIndex}
                onChange={(e) => setAptCorrectIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Solution Explanation</label>
              <textarea
                rows={3}
                required
                value={aptExplanation}
                onChange={(e) => setAptExplanation(e.target.value)}
                placeholder="Provide a step-by-step mathematical explanation..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={addAptQuestionMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
            >
              {addAptQuestionMutation.isPending ? 'Publishing...' : 'Add Aptitude Question'}
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 4: Add DSA Question */}
      {activeSubTab === 'dsa' && (
        <div className="max-w-xl mx-auto glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-850 flex items-center space-x-1.5">
            <Plus className="h-4.5 w-4.5" /> <span>Add New DSA tracker problem</span>
          </h3>

          <form onSubmit={handleAddDsa} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Problem Title</label>
              <input
                type="text"
                required
                value={dsaTitle}
                onChange={(e) => setDsaTitle(e.target.value)}
                placeholder="e.g. Reverse Linked List II"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Topic</label>
                <select
                  value={dsaTopic}
                  onChange={(e) => setDsaTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none"
                >
                  <option value="arrays">Arrays</option>
                  <option value="strings">Strings</option>
                  <option value="linked_lists">Linked Lists</option>
                  <option value="stacks">Stacks</option>
                  <option value="queues">Queues</option>
                  <option value="trees">Trees</option>
                  <option value="graphs">Graphs</option>
                  <option value="dynamic_programming">Dynamic Programming</option>
                  <option value="greedy">Greedy</option>
                  <option value="backtracking">Backtracking</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Difficulty</label>
                <select
                  value={dsaDifficulty}
                  onChange={(e) => setDsaDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Description</label>
              <textarea
                rows={4}
                required
                value={dsaDesc}
                onChange={(e) => setDsaDesc(e.target.value)}
                placeholder="Describe constraints and input details..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none resize-none"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Constraints</label>
              <input
                type="text"
                value={dsaConstraints}
                onChange={(e) => setDsaConstraints(e.target.value)}
                placeholder="1 <= nums.length <= 10^5"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Company Tags (Separated by commas)</label>
              <input
                type="text"
                value={dsaCompanies}
                onChange={(e) => setDsaCompanies(e.target.value)}
                placeholder="Google, Microsoft, Amazon"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Leetcode / Reference URL</label>
              <input
                type="url"
                value={dsaSolUrl}
                onChange={(e) => setDsaSolUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={addDsaQuestionMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
            >
              {addDsaQuestionMutation.isPending ? 'Publishing...' : 'Add DSA Question'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
