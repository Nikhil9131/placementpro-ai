'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { User, Shield, Briefcase, Plus, X, GraduationCap, Code } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, profile, fetchProfile } = useAuthStore();
  const [targetCompanyInput, setTargetCompanyInput] = useState<string>('');
  const [skillInput, setSkillInput] = useState<string>('');

  const [bio, setBio] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [graduationYear, setGraduationYear] = useState<number>(2026);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setContactNumber(profile.contactNumber || '');
      setGraduationYear(profile.graduationYear || 2026);
    }
  }, [profile]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/profiles', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      fetchProfile();
    },
  });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompanyInput.trim() || !profile) return;
    const currentCompanies = profile.targetCompanies || [];
    if (currentCompanies.includes(targetCompanyInput.trim())) return;

    updateProfileMutation.mutate({
      targetCompanies: [...currentCompanies, targetCompanyInput.trim()],
    });
    setTargetCompanyInput('');
  };

  const handleRemoveCompany = (company: string) => {
    if (!profile) return;
    const currentCompanies = profile.targetCompanies || [];
    updateProfileMutation.mutate({
      targetCompanies: currentCompanies.filter((c: string) => c !== company),
    });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim() || !profile) return;
    const currentSkills = profile.skills || [];
    if (currentSkills.includes(skillInput.trim())) return;

    updateProfileMutation.mutate({
      skills: [...currentSkills, skillInput.trim()],
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!profile) return;
    const currentSkills = profile.skills || [];
    updateProfileMutation.mutate({
      skills: currentSkills.filter((s: string) => s !== skill),
    });
  };

  const handleSaveBasic = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      bio,
      contactNumber,
      graduationYear: Number(graduationYear),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* 1. Basic details edit */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-850">
            <User className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Basic Information</h3>
          </div>

          <form onSubmit={handleSaveBasic} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Username</label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ''}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1 555-1234"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Graduation Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Short Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Software Engineer student eager to contribute to cloud systems..."
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="py-2 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'Saving details...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Skills and Targets edits */}
      <div className="space-y-6 lg:col-span-1">
        {/* target companies list */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Target Corporate Companies</h4>

          <form onSubmit={handleAddCompany} className="flex gap-2">
            <input
              type="text"
              value={targetCompanyInput}
              onChange={(e) => setTargetCompanyInput(e.target.value)}
              placeholder="Add e.g. Wipro..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile?.targetCompanies?.length === 0 ? (
              <span className="text-xs text-slate-500">No targets specified yet</span>
            ) : (
              profile?.targetCompanies?.map((company: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 bg-slate-800 border border-slate-850 px-2.5 py-1 rounded-full text-xs text-slate-350"
                >
                  <span>{company}</span>
                  <button
                    onClick={() => handleRemoveCompany(company)}
                    className="text-slate-500 hover:text-red-400 ml-1.5"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* skill list */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Tech Competencies & Skills</h4>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add e.g. Python..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile?.skills?.length === 0 ? (
              <span className="text-xs text-slate-500">No tags specified yet</span>
            ) : (
              profile?.skills?.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full text-xs text-indigo-400"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-400 hover:text-red-400 ml-1.5"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
