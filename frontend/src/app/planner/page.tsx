'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { CalendarDays, Sparkles, CheckSquare, Square, ChevronRight, Award, Flame, CalendarRange } from 'lucide-react';

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  // Form State
  const [targetCompany, setTargetCompany] = useState<string>('Google');
  const [currentSkillLevel, setCurrentSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [availableTime, setAvailableTime] = useState<number>(4);
  const [placementDate, setPlacementDate] = useState<string>('');

  // Active Plan Query
  const { data: planRes, isLoading } = useQuery({
    queryKey: ['activeStudyPlan'],
    queryFn: async () => {
      const res = await api.get('/study-plans/active');
      return res.data.studyPlan;
    },
  });

  // Generate Plan Mutation
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/study-plans/generate', payload);
      return res.data.studyPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeStudyPlan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      fetchProfile();
    },
  });

  // Toggle Task Completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ planId, taskId }: { planId: string; taskId: string }) => {
      const res = await api.post(`/study-plans/${planId}/tasks/${taskId}/toggle`);
      return res.data.studyPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeStudyPlan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      fetchProfile();
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany || !placementDate) return;

    // Convert date to standard ISO string format
    const isoDate = new Date(placementDate).toISOString();
    generateMutation.mutate({
      targetCompany,
      currentSkillLevel,
      availableTime: Number(availableTime),
      placementDate: isoDate,
    });
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center animate-pulse">
          <div className="h-8 w-48 bg-slate-800 rounded mx-auto mb-3"></div>
          <div className="h-4 w-64 bg-slate-800 rounded mx-auto"></div>
        </div>
      ) : !planRes ? (
        /* Form configuration state */
        <div className="max-w-xl mx-auto glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Configure AI Study Planner</h3>
              <p className="text-[10px] text-slate-400">Generate a tailored preparation dashboard mapping daily milestones.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Target Corporate Company</label>
              <input
                type="text"
                required
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="Google, Amazon, TCS..."
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Skill Experience Level</label>
                <select
                  value={currentSkillLevel}
                  onChange={(e: any) => setCurrentSkillLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Duration (Weeks)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  value={availableTime}
                  onChange={(e) => setAvailableTime(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Estimated Placement Date</label>
              <input
                type="date"
                required
                value={placementDate}
                onChange={(e) => setPlacementDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
            >
              <span>{generateMutation.isPending ? 'Generating custom track...' : 'Build AI Calendar'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Planner tracking layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Stats summary and custom milestones */}
          <div className="space-y-6 lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500">Track Plan Target</span>
                <h3 className="text-md font-bold text-slate-100">{planRes.targetCompany} Prep Course</h3>
              </div>

              <div className="border-t border-slate-850 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-semibold text-slate-200">{planRes.availableTime} Weeks</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Graduation Level:</span>
                  <span className="font-semibold text-indigo-400 capitalize">{planRes.currentSkillLevel}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Target Date:</span>
                  <span className="font-semibold text-slate-200">
                    {new Date(planRes.placementDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress metrics */}
              <div className="border-t border-slate-850 pt-3 space-y-1">
                {(() => {
                  const total = planRes.dailyTasks?.length || 0;
                  const completed = planRes.dailyTasks?.filter((t: any) => t.completed).length || 0;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Milestones Solved</span>
                        <span>{completed} / {total}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => generateMutation.mutate(null)} // passing null will wipe state
                className="w-full py-2.5 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-350"
              >
                Reset & Create New Plan
              </button>
            </div>

            {/* Weekly targets */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Weekly Performance Goals</h4>
              <div className="space-y-3">
                {planRes.weeklyGoals?.map((wg: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs">
                    <Award className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-250">Week {wg.week}</p>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">{wg.goal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Tasks checkbox items list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-850">
                <CalendarRange className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Daily Study Milestone Tasks</h3>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {planRes.dailyTasks?.map((task: any) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        toggleTaskMutation.mutate({
                          planId: planRes._id,
                          taskId: task.id,
                        })
                      }
                      className={`flex items-start space-x-3.5 p-3 rounded-xl border cursor-pointer hover:bg-slate-850/30 transition-all ${
                        task.completed
                          ? 'border-green-800/10 bg-green-950/5 text-slate-500'
                          : 'border-slate-850 bg-slate-900/60 text-slate-200'
                      }`}
                    >
                      <button className="flex-shrink-0 mt-0.5">
                        {task.completed ? (
                          <CheckSquare className="h-4.5 w-4.5 text-green-500" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-slate-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-relaxed ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Day {task.day}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
