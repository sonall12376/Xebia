import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from './Dashboards';
import {
  Calendar, Clock, Search, AlertCircle, AlertTriangle,
  User, CheckCircle, HelpCircle, ArrowRight
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Core Hours Calculator Helper matching specification
const calculateWorkHours = (checkInStr, checkOutStr) => {
  if (!checkInStr) return { hours: 0, status: 'Invalid' };
  
  const checkIn = new Date(checkInStr);
  if (isNaN(checkIn.getTime())) return { hours: 0, status: 'Invalid' };

  let checkOut = new Date();
  let status = 'In Progress';

  if (checkOutStr) {
    checkOut = new Date(checkOutStr);
    status = 'Completed';
    if (isNaN(checkOut.getTime())) return { hours: 0, status: 'Invalid' };
  }

  // Handle timestamp invalid bounds (check-in after check-out)
  if (checkIn > checkOut) {
    console.warn(`Check-in timestamp (${checkIn}) is after check-out (${checkOut})`);
    return { hours: 0, status: 'Invalid' };
  }

  const diffMs = checkOut - checkIn;
  const hours = diffMs / (1000 * 60 * 60);
  return { hours, status };
};

const AttendanceManagement = () => {
  const { user, token } = useAuth();
  
  // Tab state for Manager/Admin
  const [activeTab, setActiveTab] = useState(user.role === 'Employee' ? 'personal' : 'team');

  // Data state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = (user.role === 'Employee' || activeTab === 'personal') 
        ? `${API_URL}/attendance/my-history` 
        : `${API_URL}/attendance/team`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch attendance logs');
      }
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token, user.role, activeTab]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Search query match (only for Admin/Manager auditing view when not on personal tab)
    const empName = log.userId?.name || '';
    const empEmail = log.userId?.email || '';
    const isPersonal = user.role === 'Employee' || activeTab === 'personal';
    const matchesSearch = isPersonal ? true : (
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Date range match
    const logDate = new Date(log.date);
    let matchesStartDate = true;
    let matchesEndDate = true;

    if (startDateFilter) {
      const start = new Date(startDateFilter);
      start.setHours(0, 0, 0, 0);
      matchesStartDate = logDate >= start;
    }

    if (endDateFilter) {
      const end = new Date(endDateFilter);
      end.setHours(23, 59, 59, 999);
      matchesEndDate = logDate <= end;
    }

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Calculate metrics (only for Employees or when viewing personal logs)
  const employeeMetrics = () => {
    const isPersonal = user.role === 'Employee' || activeTab === 'personal';
    if (!isPersonal || logs.length === 0) return { daysPresent: 0, avgHours: '0.0' };
    
    const completedLogs = logs.filter(l => l.checkOutTime);
    const totalHours = completedLogs.reduce((acc, curr) => {
      const calc = calculateWorkHours(curr.checkInTime, curr.checkOutTime);
      return acc + (calc.status === 'Completed' ? calc.hours : 0);
    }, 0);

    const avgHours = completedLogs.length > 0 ? (totalHours / completedLogs.length).toFixed(1) : '0.0';

    return {
      daysPresent: logs.length,
      avgHours
    };
  };

  const metrics = employeeMetrics();

  return (
    <DashboardLayout title="Attendance Panel" role={user.role}>
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {user.role === 'Employee' || activeTab === 'personal' ? 'My Attendance Registry' : 'Team Presence Audit'}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
            {user.role === 'Employee' || activeTab === 'personal'
              ? 'Review clock-in histories and active shift timers'
              : 'Review and audit employee presence logs and daily check-ins'}
          </p>
        </div>
      </div>

      {/* Tabs Switcher for Manager / Admin */}
      {user.role !== 'Employee' && (
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          <button
            onClick={() => {
              setActiveTab('team');
              setSearchTerm('');
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Team Presence Audit
          </button>
          <button
            onClick={() => {
              setActiveTab('personal');
              setSearchTerm('');
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            My Attendance
          </button>
        </div>
      )}

      {/* Statistics Summary Banners */}
      {(user.role === 'Employee' || activeTab === 'personal') && !loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Days Present</p>
              <h3 className="text-3xl font-black text-slate-900">{metrics.daysPresent} days</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Average Shift Duration</p>
              <h3 className="text-3xl font-black text-slate-900">{metrics.avgHours} hrs</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Based on completed check-outs</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-5 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/20">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search filter (Only Manager/Admin when not in personal tab) */}
            {user.role !== 'Employee' && activeTab === 'team' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold placeholder-slate-400"
                />
              </div>
            )}

            {/* Date filter pickers */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                placeholder="Start Date"
                title="Start Date Filter"
                className="px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-auto"
              />
              <span className="text-xs text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                placeholder="End Date"
                title="End Date Filter"
                className="px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-auto"
              />
            </div>
          </div>

          {(searchTerm || startDateFilter || endDateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStartDateFilter('');
                setEndDateFilter('');
              }}
              className="px-4 py-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer w-full lg:w-auto mt-2 lg:mt-0 text-center"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Logs Table Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-650 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="font-bold text-sm">{error}</p>
            <button 
              onClick={fetchAttendance} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-sm">No attendance records found matching the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  {user.role !== 'Employee' && activeTab !== 'personal' && (
                    <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Employee</th>
                  )}
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Check In</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Check Out</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Work Hours</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const calculated = calculateWorkHours(log.checkInTime, log.checkOutTime);
                  
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name (Admins / Managers only when not on personal tab) */}
                      {user.role !== 'Employee' && activeTab !== 'personal' && (
                        <td className="p-4.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
                              {log.userId?.name ? log.userId.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">{log.userId?.name || 'Unknown User'}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{log.userId?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Date */}
                      <td className="p-4.5">
                        <span className="text-xs font-bold text-slate-800">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Check In */}
                      <td className="p-4.5">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg">
                          {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Check Out */}
                      <td className="p-4.5">
                        {log.checkOutTime ? (
                          <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg">
                            {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide animate-pulse">
                            Active Session
                          </span>
                        )}
                      </td>

                      {/* Work Hours (Calculated) */}
                      <td className="p-4.5">
                        {calculated.status === 'Invalid' ? (
                          <span className="text-xs text-rose-500 font-bold flex items-center">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            0.0 hrs (Invalid)
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-900">
                            {calculated.hours.toFixed(2)} hrs
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4.5">
                        {calculated.status === 'In Progress' ? (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5 mr-1 animate-spin" />
                            In Progress
                          </span>
                        ) : calculated.status === 'Completed' ? (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Error
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendanceManagement;
