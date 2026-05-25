'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Code2, FileText, UserCheck, CalendarDays, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/40 bg-dark-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/20">
              P
            </div>
            <span className="text-md font-bold bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
              PlacementPro AI
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-102"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-16">
        <section className="relative max-w-7xl mx-auto px-6 text-center space-y-8">
          {/* Neon Glow Grid Background */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] animate-pulse"></div>
            <div className="h-80 w-80 rounded-full bg-purple-500/10 blur-[100px] animate-pulse delay-700"></div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold">
            <span>Now with Gemini 1.5 Powered Analyses</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Crack Your Tech Placement with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Preparation
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one preparation engine. Track your DSA questions, attempt timed aptitude assessments,
            analyze your resume using recruiter AI, and practice live mock interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 hover:scale-102 hover:shadow-indigo-500/30 transition-all"
            >
              <span>Build My Study Plan</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-slate-800/60 border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            >
              Mock Interview Demo
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 mt-32">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <h2 className="text-2xl md:text-3xl font-bold">Everything you need to get hired</h2>
            <p className="text-xs md:text-sm text-slate-500">
              Skip generic templates. PlacementPro generates hyper-targeted preparations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col space-y-4 hover:border-slate-700/80 transition-all">
              <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-400">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-md font-bold">DSA Problem Tracker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log problems across 10+ core topics (Trees, Dynamic Programming). Filter by company tags and flag items for revisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col space-y-4 hover:border-slate-700/80 transition-all">
              <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/25 rounded-xl flex items-center justify-center text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-md font-bold">AI Resume Analyzer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your resume PDF and analyze it for ATS compatibility. Identify skill gaps, weak bullet points, and receive keyword optimizations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col space-y-4 hover:border-slate-700/80 transition-all">
              <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/25 rounded-xl flex items-center justify-center text-cyan-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-md font-bold">Interactive Mock Interviews</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice role-specific mock interviews with an AI interviewer chatbot. Get scorecards on Technical expertise, Communication, and Confidence.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-dark-950 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>© 2026 PlacementPro AI. All rights reserved.</span>
          </div>

          <div className="flex space-x-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-350 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-350 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
