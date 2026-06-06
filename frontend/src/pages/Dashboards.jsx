import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, Briefcase, Calendar, Star, AlertCircle, Clock, 
  CheckCircle2, ChevronRight, User, Shield, Phone, Mail, Award, BookOpen
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Reusable Top Navigation Layout
export const DashboardLayout = ({ title, role, children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4.5 px-6 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">PerformancePortal</h1>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <p className="text-xs text-indigo-600 font-bold tracking-wide uppercase">{role} Workspace</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation (Desktop) */}
        {role === 'Admin' && (
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
            <Link
              to="/admin/dashboard"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/admin/dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dashboard Overview
            </Link>
            <Link
              to="/admin/employees"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/admin/employees'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Employee Directory
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/projects'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Project Board
            </Link>
            <Link
              to="/attendance"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/attendance'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Attendance
            </Link>
          </nav>
        )}

        {/* Manager Navigation (Desktop) */}
        {role === 'Manager' && (
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
            <Link
              to="/manager/dashboard"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/manager/dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dashboard Overview
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/projects'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Project Board
            </Link>
            <Link
              to="/attendance"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/attendance'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Attendance
            </Link>
          </nav>
        )}

        {/* Employee Navigation (Desktop) */}
        {role === 'Employee' && (
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
            <Link
              to="/employee/dashboard"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/employee/dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dashboard Overview
            </Link>
            <Link
              to="/attendance"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                location.pathname === '/attendance'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Attendance History
            </Link>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          <button
            onClick={logout}
            className="bg-white border border-slate-200 text-slate-700 py-2 px-4 rounded-xl font-bold text-xs transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 cursor-pointer shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Navigation (Mobile Subheader) */}
      {role === 'Admin' && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-2 flex justify-center space-x-2">
          <Link
            to="/admin/dashboard"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/admin/dashboard'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/admin/employees"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/admin/employees'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Employees
          </Link>
          <Link
            to="/projects"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/projects'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Projects
          </Link>
          <Link
            to="/attendance"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/attendance'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Attendance
          </Link>
        </div>
      )}

      {/* Manager Navigation (Mobile Subheader) */}
      {role === 'Manager' && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-2 flex justify-center space-x-2">
          <Link
            to="/manager/dashboard"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/manager/dashboard'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/projects"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/projects'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Projects
          </Link>
          <Link
            to="/attendance"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/attendance'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Attendance
          </Link>
        </div>
      )}

      {/* Employee Navigation (Mobile Subheader) */}
      {role === 'Employee' && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-2 flex justify-center space-x-2">
          <Link
            to="/employee/dashboard"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/employee/dashboard'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/attendance"
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              location.pathname === '/attendance'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Attendance
          </Link>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};

// --- 1. ADMIN DASHBOARD ---
export const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch admin stats');
        }
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout title="Admin" role="Admin">
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin" role="Admin">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" role="Admin">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Employees */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Employees</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalEmployees}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Projects</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.activeProjects}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Attendance % */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Attendance</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.attendancePercent}%</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Reviews</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.pendingReviewsCount}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Feed & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-600" />
            Recent Activity Feed
          </h3>

          <div className="flow-root">
            <ul className="-mb-8">
              {stats.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, idx) => (
                  <li key={activity._id || idx}>
                    <div className="relative pb-8">
                      {idx !== stats.recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-3.5">
                        <div>
                          <span className={`h-8.5 w-8.5 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'check-in' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : activity.type === 'review' 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {activity.type === 'check-in' && <Calendar className="w-4 h-4" />}
                            {activity.type === 'review' && <Star className="w-4 h-4" />}
                            {activity.type === 'project' && <Briefcase className="w-4 h-4" />}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{activity.message}</p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-slate-400 font-bold uppercase">
                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">No activity recorded today.</div>
              )}
            </ul>
          </div>
        </div>

        {/* Administration Controls Info Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            System Console
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
            As an Administrator, you possess complete authorization to audit user statistics and system logs. You are currently viewing data fetched dynamically from MongoDB.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Database Live Connection</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">MongoDB: Localhost (27017)</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Security Mode Active</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Role Authorization Guards Loaded</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};


// --- 2. MANAGER DASHBOARD ---
export const ManagerDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchManagerStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/manager`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch manager stats');
      }
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerStats();
  }, [token]);

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Check-in failed');
      }
      fetchManagerStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Check-out failed');
      }
      fetchManagerStats();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manager" role="Manager">
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Manager" role="Manager">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manager Dashboard" role="Manager">
      {/* Attendance & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between lg:col-span-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Attendance Status</p>
            {data.todayAttendance ? (
              <div className="space-y-2 mt-1">
                <h3 className="text-xl font-extrabold text-emerald-600 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-1.5" />
                  Checked In
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Logged check-in at: <span className="font-bold text-slate-800">
                    {new Date(data.todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {data.todayAttendance.checkOutTime && (
                    <>
                      {' '}and check-out at: <span className="font-bold text-slate-800">
                        {new Date(data.todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </p>
                {!data.todayAttendance.checkOutTime && (
                  <button
                    onClick={handleCheckOut}
                    className="mt-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer hover:shadow active:scale-95"
                  >
                    Clock Out
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <h3 className="text-xl font-extrabold text-slate-400 flex items-center">
                  <Clock className="w-5 h-5 mr-1.5" />
                  No check-in record
                </h3>
                <p className="text-xs font-semibold text-slate-500 mb-2">Please clock in to register attendance logs.</p>
                <button
                  onClick={handleCheckIn}
                  className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer hover:shadow active:scale-95"
                >
                  Clock In
                </button>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Direct Reports card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Direct Reports</p>
            <h3 className="text-3xl font-black text-slate-900">{data.teamCount}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Currently assigned to your team</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Managed Projects & Reviews Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Managed Projects</p>
            <h3 className="text-3xl font-black text-slate-900">{data.projects.length}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Assigned project boards</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reviews Pending</p>
            <h3 className="text-3xl font-black text-slate-900">{data.pendingReviews.length}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Direct reports waiting evaluation</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Team reports grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Team Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            My Team Directory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.attendanceSummary.map((member) => (
              <div key={member._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50 relative hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase">{member.designation}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    member.status === 'Checked In' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : member.status === 'Checked Out' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {member.status}
                  </span>
                  
                  {data.pendingReviews.some(p => p._id === member._id) ? (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Review Pending</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Reviewed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Attendance Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-600" />
            Today's Check-ins
          </h3>
          <div className="divide-y divide-slate-100">
            {data.attendanceSummary.map((member) => (
              <div key={member._id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{member.designation}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    member.status === 'Checked In' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : member.status === 'Checked Out' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {member.status}
                  </span>
                  {member.checkInTime && (
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                      IN: {new Date(member.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
          Active Team Projects
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Timeline</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Team Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.projects.map((proj) => (
                <tr key={proj._id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="py-4">
                    <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                    <p className="text-xs text-slate-500 max-w-xs truncate">{proj.description}</p>
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : proj.status === 'In Progress' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.priority === 'High' 
                        ? 'bg-red-50 text-red-700' 
                        : proj.priority === 'Medium' 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {proj.priority}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-semibold text-slate-500">
                    {new Date(proj.startDate).toLocaleDateString()} - {new Date(proj.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {proj.employeeIds.map((emp) => (
                        <div 
                          key={emp._id} 
                          title={emp.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center"
                        >
                          {emp.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};


// --- 3. EMPLOYEE DASHBOARD ---
export const EmployeeDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployeeStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch employee stats');
      }
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeStats();
  }, [token]);

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Check-in failed');
      }
      fetchEmployeeStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Check-out failed');
      }
      fetchEmployeeStats();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Employee" role="Employee">
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Employee" role="Employee">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  const { scoreMetrics } = data;

  return (
    <DashboardLayout title="Employee Portal" role="Employee">
      {/* Attendance & Score Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Attendance widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between md:col-span-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Attendance Status</p>
            {data.todayAttendance ? (
              <div className="space-y-2 mt-1">
                <h3 className="text-xl font-extrabold text-emerald-600 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-1.5" />
                  Checked In
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Logged check-in at: <span className="font-bold text-slate-800">
                    {new Date(data.todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {data.todayAttendance.checkOutTime && (
                    <>
                      {' '}and check-out at: <span className="font-bold text-slate-800">
                        {new Date(data.todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </p>
                {!data.todayAttendance.checkOutTime && (
                  <button
                    onClick={handleCheckOut}
                    className="mt-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer hover:shadow active:scale-95"
                  >
                    Clock Out
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <h3 className="text-xl font-extrabold text-slate-400 flex items-center">
                  <Clock className="w-5 h-5 mr-1.5" />
                  No check-in record
                </h3>
                <p className="text-xs font-semibold text-slate-500 mb-2">Please clock in to register attendance logs.</p>
                <button
                  onClick={handleCheckIn}
                  className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer hover:shadow active:scale-95"
                >
                  Clock In
                </button>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Performance Score Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Rating Score</p>
            <h3 className="text-3xl font-black text-slate-900">
              {scoreMetrics.overallAverage > 0 ? `${scoreMetrics.overallAverage} / 5` : 'N/A'}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Based on submitted manager reports</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Employee details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: Projects & reviews list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
              My Assigned Projects
            </h3>

            {data.projects && data.projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.projects.map((proj) => (
                  <div key={proj._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {proj.status}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        proj.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {proj.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{proj.name}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{proj.description}</p>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>Timeline:</span>
                      <span className="text-slate-700">{new Date(proj.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No projects currently assigned to you.</div>
            )}
          </div>

          {/* Review comments list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
              Manager Evaluation Logs
            </h3>

            {data.reviews && data.reviews.length > 0 ? (
              <div className="space-y-6">
                {data.reviews.map((rev) => (
                  <div key={rev._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{rev.managerId?.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{rev.managerId?.designation}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-100">
                      "{rev.comments}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No performance reviews received yet.</div>
            )}
          </div>
        </div>

        {/* Right pane: Star Ratings Visualizer */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-indigo-600" />
            Performance Breakdown
          </h3>

          {scoreMetrics.overallAverage > 0 ? (
            <div className="space-y-5">
              {/* Technical */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Technical Skills</span>
                  <span>{scoreMetrics.technical} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreMetrics.technical / 5) * 100}%` }}></div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Communication</span>
                  <span>{scoreMetrics.communication} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreMetrics.communication / 5) * 100}%` }}></div>
                </div>
              </div>

              {/* Teamwork */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Teamwork</span>
                  <span>{scoreMetrics.teamwork} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreMetrics.teamwork / 5) * 100}%` }}></div>
                </div>
              </div>

              {/* Problem Solving */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Problem Solving</span>
                  <span>{scoreMetrics.problemSolving} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreMetrics.problemSolving / 5) * 100}%` }}></div>
                </div>
              </div>

              {/* Leadership */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Leadership</span>
                  <span>{scoreMetrics.leadership} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreMetrics.leadership / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No scores submitted yet.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
