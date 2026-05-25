'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Brain, Clock, ChevronRight, CheckCircle, XCircle, Award, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AptitudePage() {
  const queryClient = useQueryClient();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [activeTab, setActiveTab] = useState<'quiz' | 'leaderboard'>('quiz');
  
  // Quiz session state
  const [quizState, setQuizState] = useState<'idle' | 'testing' | 'finished'>('idle');
  const [category, setCategory] = useState<string>('quantitative');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [results, setResults] = useState<any>(null);

  // Leaderboard data
  const { data: leaderboard, isLoading: leadLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/aptitude/leaderboard');
      return res.data.leaderboard;
    },
    enabled: activeTab === 'leaderboard',
  });

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/aptitude/start', { category, difficulty, limit: 10 });
      return res.data;
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setCurrentIdx(0);
      setAnswers({});
      setTimeLeft(data.timeLimitSeconds);
      setTimeTaken(0);
      setQuizState('testing');
      setResults(null);
    },
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (payload: { category: string; answers: any[]; timeTaken: number }) => {
      const res = await api.post('/aptitude/submit', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setResults(data.detailedAnalysis);
      setQuizState('finished');
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      fetchProfile();
    },
  });

  // Timer countdown hook
  useEffect(() => {
    if (quizState !== 'testing') return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setTimeTaken((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizState]);

  const handleAutoSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([qId, idx]) => ({
      questionId: qId,
      selectedAnswerIndex: idx,
    }));
    submitQuizMutation.mutate({
      category,
      answers: formattedAnswers,
      timeTaken,
    });
  };

  const handleManualSubmit = () => {
    // Fill remaining unanswered questions with -1
    const finalAnswers = questions.map((q) => {
      const selected = answers[q._id];
      return {
        questionId: q._id,
        selectedAnswerIndex: selected !== undefined ? selected : -1,
      };
    });

    submitQuizMutation.mutate({
      category,
      answers: finalAnswers,
      timeTaken,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Tab controls */}
      {quizState === 'idle' && (
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timed Practice
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Leaderboard
          </button>
        </div>
      )}

      {/* 1. QUIZ CHOOSE SETTING VIEW */}
      {activeTab === 'quiz' && quizState === 'idle' && (
        <div className="max-w-xl mx-auto glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Brain className="h-6 w-6 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">Start Timed Assessment</h3>
              <p className="text-[10px] text-slate-400">10 randomly generated questions with 10-minute timer.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Choose Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="quantitative">Quantitative Aptitude</option>
                <option value="logical">Logical Reasoning</option>
                <option value="verbal">Verbal Ability</option>
                <option value="data_interpretation">Data Interpretation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-center rounded-lg border text-xs font-bold capitalize transition-all ${
                      difficulty === d
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-850 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => startQuizMutation.mutate()}
            disabled={startQuizMutation.isPending}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
          >
            <span>{startQuizMutation.isPending ? 'Generating Quiz...' : 'Start Assessment'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. QUIZ TESTING PORTAL VIEW */}
      {quizState === 'testing' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass p-4 rounded-xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/15 border border-indigo-500/10 px-3 py-1.5 rounded-lg text-xs font-bold">
              <Clock className="h-4.5 w-4.5 animate-pulse" />
              <span>{formatTime(timeLeft)} Left</span>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
            <p className="text-sm font-semibold text-slate-100">{questions[currentIdx].questionText}</p>

            <div className="grid gap-3 pt-2">
              {questions[currentIdx].options.map((option: string, idx: number) => {
                const isSelected = answers[questions[currentIdx]._id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [questions[currentIdx]._id]: idx }))
                    }
                    className={`text-left p-4 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-slate-100 font-bold'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-6 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleManualSubmit}
                  className="px-6 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-500"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. QUIZ RESULTS SUMMARY VIEW */}
      {quizState === 'finished' && results && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-4">
            <Award className="h-12 w-12 text-indigo-400 mx-auto" />
            <h3 className="text-xl font-bold">Quiz Finished</h3>
            <p className="text-xs text-slate-400">Here is your assessment scorecard breakdown</p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Correct</span>
                <span className="text-xl font-extrabold text-green-400 mt-1">{results.score}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total</span>
                <span className="text-xl font-extrabold text-slate-300 mt-1">{results.totalQuestions}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Accuracy</span>
                <span className="text-xl font-extrabold text-indigo-400 mt-1">{results.percentage}%</span>
              </div>
            </div>

            <button
              onClick={() => setQuizState('idle')}
              className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white mt-4"
            >
              Back to Portal
            </button>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 pl-1">Detailed Question Breakdown</h4>
            {results.questions.map((question: any, idx: number) => {
              const selectedIdx = answers[question.id];
              const isCorrect = selectedIdx === question.correctAnswerIndex;

              return (
                <div key={idx} className="glass-card p-6 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                    {isCorrect ? (
                      <span className="flex items-center space-x-1 text-green-400 text-xs font-bold">
                        <CheckCircle className="h-4 w-4" /> <span>Correct</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-red-400 text-xs font-bold">
                        <XCircle className="h-4 w-4" /> <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-100">{question.questionText}</p>

                  <div className="grid gap-2">
                    {question.options.map((option: string, optIdx: number) => {
                      let btnBg = 'bg-slate-900 border-slate-850 text-slate-400';
                      if (optIdx === question.correctAnswerIndex) {
                        btnBg = 'bg-green-950/20 border-green-800/20 text-green-400 font-bold';
                      } else if (optIdx === selectedIdx && !isCorrect) {
                        btnBg = 'bg-red-950/20 border-red-800/20 text-red-400';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border text-xs font-medium ${btnBg}`}>
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-950/50 rounded-lg text-[11px] text-slate-400 leading-relaxed border border-slate-850">
                    <span className="font-bold text-indigo-400 block mb-1">Explanation:</span>
                    {question.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD TAB VIEW */}
      {activeTab === 'leaderboard' && (
        <div className="max-w-xl mx-auto glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center space-x-2 bg-slate-900/50">
            <Trophy className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Global Leaderboard</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {leadLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading Leaderboards...</div>
            ) : leaderboard?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No attempts logged on platform yet</div>
            ) : (
              leaderboard?.map((item: any, idx: number) => (
                <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-slate-500 w-4">{idx + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {item.user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{item.user.username}</p>
                      <p className="text-[10px] text-slate-500">{item.totalAttempts} Quiz Attempts</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-extrabold text-indigo-400">{item.accuracy}% Accuracy</p>
                    <p className="text-[10px] text-slate-500">Avg score: {Math.round(item.avgScore)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
