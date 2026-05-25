'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Code2, Search, Filter, MessageSquareCode, CheckCircle, Flame, ExternalLink, Bookmark } from 'lucide-react';

export default function DsaPage() {
  const queryClient = useQueryClient();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Notes Modal state
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  // Fetch Questions
  const { data: questionsRes, isLoading: qLoading } = useQuery({
    queryKey: ['dsaQuestions', topic, difficulty, status, search],
    queryFn: async () => {
      const res = await api.get('/dsa/questions', {
        params: { topic, difficulty, status, search },
      });
      return res.data;
    },
  });

  // Fetch Stats
  const { data: statsRes, isLoading: sLoading } = useQuery({
    queryKey: ['dsaStats'],
    queryFn: async () => {
      const res = await api.get('/dsa/stats');
      return res.data.stats;
    },
  });

  // Update progress mutation
  const progressMutation = useMutation({
    mutationFn: async ({ questionId, status, notes }: { questionId: string; status: string; notes?: string }) => {
      const res = await api.post(`/dsa/questions/${questionId}/progress`, { status, notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsaQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['dsaStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      fetchProfile();
      setActiveQuestion(null);
    },
  });

  const handleOpenNotes = (q: any) => {
    setActiveQuestion(q);
    setNotesText(q.progress?.notes || '');
  };

  const handleSaveNotes = () => {
    if (!activeQuestion) return;
    const currentStatus = activeQuestion.progress?.status || 'solved';
    progressMutation.mutate({
      questionId: activeQuestion._id,
      status: currentStatus,
      notes: notesText,
    });
  };

  const topicsList = [
    { name: 'All Topics', val: '' },
    { name: 'Arrays', val: 'arrays' },
    { name: 'Strings', val: 'strings' },
    { name: 'Linked Lists', val: 'linked_lists' },
    { name: 'Stacks', val: 'stacks' },
    { name: 'Queues', val: 'queues' },
    { name: 'Trees', val: 'trees' },
    { name: 'Graphs', val: 'graphs' },
    { name: 'Dynamic Programming', val: 'dynamic_programming' },
    { name: 'Greedy', val: 'greedy' },
    { name: 'Backtracking', val: 'backtracking' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Solved</span>
            <span className="text-lg font-extrabold text-slate-200">{statsRes?.solved || 0}</span>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Need Revision</span>
            <span className="text-lg font-extrabold text-slate-200">{statsRes?.revision || 0}</span>
          </div>
          <Bookmark className="h-5 w-5 text-orange-500" />
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between col-span-2">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Progress Rate</span>
            <span className="text-lg font-extrabold text-slate-200">{statsRes?.percentage || 0}% Completion</span>
          </div>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${statsRes?.percentage || 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by name or description..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Difficulty */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="solved">Solved</option>
          <option value="revision">Need Revision</option>
          <option value="unsolved">Unsolved</option>
        </select>
      </div>

      {/* 3. Topics list pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {topicsList.map((item) => (
          <button
            key={item.val}
            onClick={() => setTopic(item.val)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold capitalize border transition-all ${
              topic === item.val
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                : 'border-slate-850 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* 4. Questions List */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/40 border-b border-slate-850 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Problem</th>
              <th className="px-6 py-3.5">Topic</th>
              <th className="px-6 py-3.5">Difficulty</th>
              <th className="px-6 py-3.5">Companies</th>
              <th className="px-6 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-xs text-slate-350">
            {qLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">Loading DSA Tracker...</td>
              </tr>
            ) : questionsRes?.questions?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">No matching questions found</td>
              </tr>
            ) : (
              questionsRes?.questions?.map((q: any) => {
                const isSolved = q.progress?.status === 'solved';
                const isRevision = q.progress?.status === 'revision_needed';

                return (
                  <tr key={q._id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      {isSolved ? (
                        <span className="inline-flex items-center text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full text-[9px] border border-green-800/10">Solved</span>
                      ) : isRevision ? (
                        <span className="inline-flex items-center text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full text-[9px] border border-orange-800/10">Revision</span>
                      ) : (
                        <span className="inline-flex items-center text-slate-500 bg-slate-800/20 px-2 py-0.5 rounded-full text-[9px]">Unsolved</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{q.title}</span>
                        {q.solutionUrl && (
                          <a
                            href={q.solutionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-0.5 mt-0.5"
                          >
                            <span>Leetcode Link</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 capitalize font-medium">{q.topic.replace('_', ' ')}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`font-bold uppercase text-[9px] ${
                          q.difficulty === 'easy'
                            ? 'text-green-400'
                            : q.difficulty === 'medium'
                            ? 'text-orange-400'
                            : 'text-red-400'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {q.companyTags?.slice(0, 3).map((c: string, idx: number) => (
                          <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-400">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Solved trigger */}
                        <button
                          onClick={() =>
                            progressMutation.mutate({
                              questionId: q._id,
                              status: isSolved ? 'unsolved' : 'solved',
                            })
                          }
                          className={`p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-[10px] font-bold ${
                            isSolved ? 'text-green-400 border border-green-500/20' : 'text-slate-400'
                          }`}
                          title={isSolved ? 'Mark Unsolved' : 'Mark Solved'}
                        >
                          ✓
                        </button>

                        {/* Revision trigger */}
                        <button
                          onClick={() =>
                            progressMutation.mutate({
                              questionId: q._id,
                              status: isRevision ? 'unsolved' : 'revision_needed',
                            })
                          }
                          className={`p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-[10px] font-bold ${
                            isRevision ? 'text-orange-400 border border-orange-500/20' : 'text-slate-400'
                          }`}
                          title="Need Revision"
                        >
                          ⚐
                        </button>

                        {/* Notes popup */}
                        <button
                          onClick={() => handleOpenNotes(q)}
                          className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400"
                          title="Write notes"
                        >
                          <MessageSquareCode className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Notes Modal overlay */}
      {activeQuestion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400">Save Notes: {activeQuestion.title}</span>
              <button
                onClick={() => setActiveQuestion(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Problem Description</label>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-850 max-h-32 overflow-y-auto">
                {activeQuestion.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">My Custom Notes</label>
              <textarea
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Write your approach, time complexity analysis, or key constraints here..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveQuestion(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={progressMutation.isPending}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                {progressMutation.isPending ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
