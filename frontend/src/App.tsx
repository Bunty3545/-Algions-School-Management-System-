import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { AdminPortal } from './views/AdminPortal';
import { TeacherPortal } from './views/TeacherPortal';
import { GuardianPortal } from './views/GuardianPortal';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading Algions SMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {!user ? (
          <LoginView />
        ) : user.role === 'ADMIN' ? (
          <AdminPortal />
        ) : user.role === 'TEACHER' ? (
          <TeacherPortal />
        ) : (
          <GuardianPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Algions AI Labs Assessment</span>
            <span>• Full-Stack School Management System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>TypeScript • Prisma ORM • React • Tailwind</span>
            <span>• Zero external DB dependencies</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
