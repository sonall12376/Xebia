import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import {
  AdminDashboard,
  ManagerDashboard,
  EmployeeDashboard,
} from './pages/Dashboards';

// Root route dispatcher that redirects authenticated users to their dashboard
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-semibold text-slate-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'Manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirection */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
