import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ title, role, children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">PerformancePortal</h1>
            <p className="text-xs text-indigo-600 font-semibold">{role} Console</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="bg-white border border-slate-200 text-slate-700 py-2 px-4 rounded-xl font-semibold text-xs transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6 transition-all duration-300 hover:shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500 text-sm mb-6">
            Welcome back, <span className="font-semibold text-slate-900">{user?.name}</span>. You are successfully logged in under the role: <span className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full">{user?.role}</span>
          </p>
          {children}
        </div>
      </main>
    </div>
  );
};

export const AdminDashboard = () => {
  return (
    <DashboardLayout title="Admin Dashboard" role="Admin">
      <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50">
        <svg
          className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
        <h3 className="text-base font-bold text-slate-900 mb-1">Administrative Workspace Initialized</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          This dashboard placeholder validates that the Admin routing middleware and role guards are working. Full dashboard components will be implemented in Module 2.
        </p>
      </div>
    </DashboardLayout>
  );
};

export const ManagerDashboard = () => {
  return (
    <DashboardLayout title="Manager Dashboard" role="Manager">
      <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50">
        <svg
          className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-base font-bold text-slate-900 mb-1">Manager Workspace Initialized</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          This dashboard placeholder validates that the Manager routing middleware and role guards are working. Full team metrics will be implemented in Module 2.
        </p>
      </div>
    </DashboardLayout>
  );
};

export const EmployeeDashboard = () => {
  return (
    <DashboardLayout title="Employee Dashboard" role="Employee">
      <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50">
        <svg
          className="w-12 h-12 text-indigo-600 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h3 className="text-base font-bold text-slate-900 mb-1">Personal Workspace Initialized</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          This dashboard placeholder validates that the Employee routing middleware and role guards are working. My projects and performance statistics will be implemented in Module 2.
        </p>
      </div>
    </DashboardLayout>
  );
};
