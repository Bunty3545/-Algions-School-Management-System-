import React from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { ShieldCheck, GraduationCap, Users, BookOpen, LogOut, ExternalLink, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchPersona, loading } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">System Admin</span>;
      case 'TEACHER':
        return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">Teacher Staff</span>;
      case 'GUARDIAN':
        return <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">Guardian</span>;
      case 'STUDENT':
        return <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Reviewer Quick Persona Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Reviewer Quick Switcher:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(DEMO_PERSONAS) as Array<keyof typeof DEMO_PERSONAS>).map((key) => {
            const p = DEMO_PERSONAS[key];
            const isActive = user?.email === p.email;
            return (
              <button
                key={key}
                onClick={() => switchPersona(key)}
                disabled={loading}
                title={p.description}
                className={`px-2.5 py-0.5 rounded transition text-xs font-medium flex items-center gap-1 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm ring-1 ring-white/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {key === 'admin' && <ShieldCheck className="w-3 h-3 text-purple-300" />}
                {key === 'teacher' && <BookOpen className="w-3 h-3 text-blue-300" />}
                {key === 'guardian' && <Users className="w-3 h-3 text-emerald-300" />}
                {key === 'student' && <GraduationCap className="w-3 h-3 text-amber-300" />}
                <span>{p.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 font-bold text-xl">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">ALGIONS</span>
              <span className="text-xs bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200">v1.0</span>
            </div>
            <p className="text-xs text-slate-500 font-medium -mt-0.5">School Management System</p>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>OpenAPI Docs</span>
          </a>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <div>{getRoleBadge(user.role)}</div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  );
};
