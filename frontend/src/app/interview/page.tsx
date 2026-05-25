'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { UserCheck, Sparkles, Send, Calendar, Award, CheckCircle, ChevronRight } from 'lucide-react';

export default function InterviewPage() {
  const queryClient = useQueryClient();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [role, setRole] = useState<string>('software_engineer');
  const [session, setSession] = useState<any | null>(null);
  const [answerText, setAnswerText] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.chatHistory]);

  // Start interview mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/interviews/start', { type: role });
      return res.data.session;
    },
    onSuccess: (newSession) => {
      setSession(newSession);
      setAnswerText('');
      queryClient.invalidateQueries({ queryKey: ['interviewHistory'] });
    },
  });

  // Submit response mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (payload: { sessionId: string; answer: string }) => {
      const res = await api.post(`/interviews/session/${payload.sessionId}/answer`, {
        answer: payload.answer,
      });
      return res.data.session;
    },
    onSuccess: (updatedSession) => {
      setSession(updatedSession);
      setAnswerText('');
      if (updatedSession.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['interviewHistory'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        fetchProfile();
      }
    },
  });

  // Fetch past session details
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: async () => {
      const res = await api.get('/interviews/history');
      return res.data.history;
    },
  });

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !session) return;
    submitAnswerMutation.mutate({
      sessionId: session._id,
      answer: answerText,
    });
  };

  const rolesList = [
    { label: 'Software Engineer', val: 'software_engineer' },
    { label: 'Frontend Developer', val: 'frontend_developer' },
    { label: 'Backend Developer', val: 'backend_developer' },
    { label: 'Full Stack Developer', val: 'full_stack_developer' },
    { label: 'Data Analyst', val: 'data_analyst' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* LEFT: Dashboard details / Selection / History */}
      <div className="space-y-6 lg:col-span-1">
        {session?.status === 'in_progress' ? (
          /* Active Interview Sidebar Info */
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <span>Live Interview Session</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Role: <span className="text-indigo-400 capitalize font-semibold">{session.type.replace('_', ' ')}</span>
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                <span>Rounds Completed</span>
                <span>{session.chatHistory.filter((c: any) => c.role === 'candidate').length} / 4</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(session.chatHistory.filter((c: any) => c.role === 'candidate').length / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => setSession(null)}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-red-400 border border-slate-700/60"
            >
              Quit Interview
            </button>
          </div>
        ) : (
          /* Pick Role to Start */
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <UserCheck className="h-4.5 w-4.5 text-indigo-400" />
              <span>Start Mock Assessment</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Target Job Profile</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                {rolesList.map((r) => (
                  <option key={r.val} value={r.val}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
            >
              {startMutation.isPending ? 'Connecting AI...' : 'Enter Interview Cabin'}
            </button>
          </div>
        )}

        {/* History List */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="h-4.5 w-4.5 text-slate-400" />
            <span>Interview Log History</span>
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-850">
            {historyLoading ? (
              <p className="text-xs text-slate-500 p-2 text-center">Loading logs...</p>
            ) : historyRes?.length === 0 ? (
              <p className="text-xs text-slate-500 p-2 text-center">No past interviews</p>
            ) : (
              historyRes?.map((h: any) => (
                <button
                  key={h._id}
                  onClick={() => setSession(h)}
                  className={`w-full text-left py-2.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                    session?._id === h._id ? 'bg-slate-800/50' : 'hover:bg-slate-850/40'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-350 capitalize leading-none">
                      {h.type.replace('_', ' ')}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {h.status === 'in_progress' ? 'Active now' : new Date(h.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {h.status === 'in_progress' ? 'Resume' : `${h.scores?.final || 0}%`}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: CHATBOARD CONTAINER OR RESULTS PANEL */}
      <div className="lg:col-span-2">
        {/* State 1: Active Chat interviewer */}
        {session && session.status === 'in_progress' && (
          <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-[500px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/30">
              <span className="text-xs font-bold text-slate-300 capitalize">
                Cabin Room: {session.type.replace('_', ' ')}
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {session.chatHistory.map((msg: any, idx: number) => {
                const isInterviewer = msg.role === 'interviewer';
                return (
                  <div
                    key={idx}
                    className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                        isInterviewer
                          ? 'bg-slate-850 border border-slate-800 rounded-tl-none text-slate-200'
                          : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10 font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-850 bg-slate-900/20 flex gap-2">
              <textarea
                rows={1}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your structured technical response..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={submitAnswerMutation.isPending || !answerText.trim()}
                className="px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* State 2: Evaluation Scorecard finished */}
        {session && session.status === 'completed' && (
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-4 relative">
              <Award className="h-12 w-12 text-indigo-400 mx-auto" />
              <h3 className="text-xl font-bold">Interview Concluded</h3>
              <p className="text-xs text-slate-400">Scorecard evaluation aggregated by Gemini recruiter model</p>

              <div className="grid grid-cols-4 gap-4 pt-4">
                {[
                  { label: 'Final Score', score: session.scores?.final || 0 },
                  { label: 'Technical', score: session.scores?.technical || 0 },
                  { label: 'Communication', score: session.scores?.communication || 0 },
                  { label: 'Confidence', score: session.scores?.confidence || 0 },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{item.label}</span>
                    <span className="text-xl font-extrabold text-indigo-400 mt-1">{item.score}%</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-350 leading-relaxed text-left">
                <span className="font-bold text-indigo-400 block mb-1">Recruiter Review:</span>
                {session.overallFeedback}
              </div>
            </div>

            {/* Question by question feedback */}
            {session.evaluations && session.evaluations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-200 pl-1">Detailed Question-by-Question Review</h4>
                {session.evaluations.map((evalItem: any, idx: number) => (
                  <div key={idx} className="glass-card p-6 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                      <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                      <div className="flex space-x-3 text-[10px] font-bold text-slate-400">
                        <span>Tech: {evalItem.scores?.technical || 0}%</span>
                        <span>Comm: {evalItem.scores?.communication || 0}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-indigo-400">Q: {evalItem.questionText}</p>
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                        <span className="font-bold text-slate-500 block mb-1">Your Answer:</span>
                        {evalItem.candidateAnswer}
                      </p>
                      <p className="text-xs text-slate-400 bg-indigo-950/5 p-3 rounded-lg border border-indigo-900/10">
                        <span className="font-bold text-indigo-400 block mb-1">Feedback:</span>
                        {evalItem.feedback}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* State 3: Empty State */}
        {!session && (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <UserCheck className="h-12 w-12 text-slate-650 mx-auto" />
            <h4 className="text-sm font-bold text-slate-350">Cabin Door Closed</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select a target role on the left and enter the cabin to begin your interactive chatbot assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
