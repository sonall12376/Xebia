import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100 transition-all duration-300 hover:shadow-2xl">
        {/* App Logo/Icon representation */}
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-indigo-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Performance Portal
        </h1>
        <p className="text-sm text-slate-500 mb-8 font-medium">
          Employee Performance Management System
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-left p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <span className="text-sm font-semibold text-slate-700">Database Schemas Initialized</span>
          </div>

          <div className="flex items-center space-x-3 text-left p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <span className="text-sm font-semibold text-slate-700">Backend Server Foundation Ready</span>
          </div>

          <div className="flex items-center space-x-3 text-left p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <span className="text-sm font-semibold text-slate-700">Vite & Tailwind CSS Active</span>
          </div>
        </div>

        <button 
          onClick={() => alert("Verification setup is complete! Standing by for further instructions.")}
          className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          Check Foundational Status
        </button>
      </div>
      <div className="mt-8 text-xs text-slate-400 font-medium tracking-wide">
        PHASE 1 SETUP • READY
      </div>
    </div>
  );
}

export default App;
