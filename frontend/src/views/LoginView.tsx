import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { ShieldCheck, BookOpen, Users, GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, switchPersona, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Left column: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to Algions SMS</h1>
            <p className="text-sm text-slate-500 mt-1">Select a reviewer persona or enter credentials</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/20 transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right column: 1-Click Reviewer Personas */}
        <div className="bg-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium mb-4">
              <span>⚡ Fast Track Review</span>
            </div>
            <h2 className="text-xl font-bold">1-Click Demo Personas</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any role to test its full end-to-end journey and server-side RBAC permissions.
            </p>

            <div className="mt-6 space-y-3">
              {(Object.keys(DEMO_PERSONAS) as Array<keyof typeof DEMO_PERSONAS>).map((key) => {
                const p = DEMO_PERSONAS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchPersona(key)}
                    disabled={loading}
                    className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-primary-500/50 text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-700/60 group-hover:bg-primary-600/30 transition">
                          {key === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                          {key === 'teacher' && <BookOpen className="w-4 h-4 text-blue-400" />}
                          {key === 'guardian' && <Users className="w-4 h-4 text-emerald-400" />}
                          {key === 'student' && <GraduationCap className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-white">{p.label}</div>
                          <div className="text-[11px] text-slate-400">{p.email}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-primary-400 group-hover:translate-x-0.5 transition">Login →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Algions Assessment • Role-Based Access Control & Immutable Ledger
          </div>
        </div>
      </div>
    </div>
  );
};
