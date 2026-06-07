import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from './Dashboards';
import {
  Star, Award, Edit, Trash2, Search, AlertCircle, 
  MessageSquare, User, Shield, CheckCircle2, Plus, X, Calendar
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Interactive/Static Star Rating Component
const StarRating = ({ value, onChange = null, size = 5 }) => {
  const [hoverValue, setHoverValue] = useState(null);
  const stars = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className="flex space-x-1">
      {stars.map((star) => {
        const isLit = hoverValue !== null ? star <= hoverValue : star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => onChange && setHoverValue(star)}
            onMouseLeave={() => onChange && setHoverValue(null)}
            className={`${
              onChange ? 'cursor-pointer focus:outline-none transition-transform hover:scale-120' : 'cursor-default'
            }`}
          >
            <Star
              className={`w-5 h-5 transition-colors duration-150 ${
                isLit 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-slate-200 fill-none'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

// Colored Score Badge helper
const ScoreBadge = ({ score }) => {
  const val = Number(score);
  let colorClass = 'bg-slate-100 text-slate-700';

  if (val >= 4.0) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
  } else if (val >= 3.0) {
    colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-100';
  } else if (val >= 2.0) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-100';
  } else if (val > 0) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-100';
  }

  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
      {val.toFixed(1)} / 5.0
    </span>
  );
};

const ReviewManagement = () => {
  const { user, token } = useAuth();
  
  // Data states
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state for Manager/Admin
  const [activeTab, setActiveTab] = useState(user.role === 'Employee' ? 'my-reviews' : 'pending');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Review Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  // Form ratings
  const [ratings, setRatings] = useState({
    technical: 0,
    communication: 0,
    teamwork: 0,
    problemSolving: 0,
    leadership: 0,
    comments: ''
  });
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'Employee') {
        const response = await fetch(`${API_URL}/reviews/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch reviews');
        setReviews(data);
      } else if (user.role === 'Manager') {
        // Fetch manager reports
        const dashboardRes = await fetch(`${API_URL}/dashboard/manager`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dbData = await dashboardRes.json();
        if (!dashboardRes.ok) throw new Error(dbData.message || 'Failed to fetch reports');
        setEmployees(dbData.attendanceSummary || []);

        // Fetch submitted reviews
        const reviewsRes = await fetch(`${API_URL}/reviews/manager`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const revData = await reviewsRes.json();
        if (!reviewsRes.ok) throw new Error(revData.message || 'Failed to fetch reviews');
        setReviews(revData);
      } else if (user.role === 'Admin') {
        // Fetch all employees (excluding admin)
        const empRes = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const empData = await empRes.json();
        if (!empRes.ok) throw new Error(empData.message || 'Failed to fetch employees');
        setEmployees(empData);

        // Fetch all reviews
        const reviewsRes = await fetch(`${API_URL}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const revData = await reviewsRes.json();
        if (!reviewsRes.ok) throw new Error(revData.message || 'Failed to fetch reviews');
        setReviews(revData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user.role]);

  // Open modal to evaluate
  const handleOpenEvaluate = (emp) => {
    setSelectedEmployee(emp);
    setEditingReview(null);
    setRatings({
      technical: 0,
      communication: 0,
      teamwork: 0,
      problemSolving: 0,
      leadership: 0,
      comments: ''
    });
    setFormError(null);
    setShowModal(true);
  };

  // Open modal to edit existing review
  const handleOpenEdit = (review) => {
    setEditingReview(review);
    setSelectedEmployee(review.employeeId);
    setRatings({
      technical: review.technical,
      communication: review.communication,
      teamwork: review.teamwork,
      problemSolving: review.problemSolving,
      leadership: review.leadership,
      comments: review.comments || ''
    });
    setFormError(null);
    setShowModal(true);
  };

  // Submit evaluation form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate that all scores are rated
    const unrated = Object.keys(ratings).find(key => key !== 'comments' && ratings[key] === 0);
    if (unrated) {
      setFormError(`Please select a rating for ${unrated.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
      return;
    }

    try {
      const endpoint = editingReview 
        ? `${API_URL}/reviews/${editingReview._id}` 
        : `${API_URL}/reviews`;
      
      const method = editingReview ? 'PUT' : 'POST';
      const body = editingReview 
        ? ratings 
        : { employeeId: selectedEmployee._id, ...ratings };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to submit review');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this performance evaluation? This action is permanent.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter lists based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubmittedReviews = reviews.filter(rev => {
    const empName = rev.employeeId?.name || '';
    const empEmail = rev.employeeId?.email || '';
    const managerName = rev.managerId?.name || '';
    return (
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      managerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate lists
  // 1. Pending Evaluations: Direct reports (or all employees for Admin) who do NOT have a review from this evaluator
  const pendingEvaluations = filteredEmployees.filter(emp => {
    // If Admin, anyone without any reviews. If Manager, reports without review from this manager
    if (user.role === 'Admin') {
      return !reviews.some(rev => rev.employeeId?._id === emp._id || rev.employeeId === emp._id);
    }
    // Manager
    return !reviews.some(rev => rev.employeeId?._id === emp._id);
  });

  // Helper to compute overall average rating
  const getAverageScore = (rev) => {
    const sum = rev.technical + rev.communication + rev.teamwork + rev.problemSolving + rev.leadership;
    return sum / 5;
  };

  return (
    <DashboardLayout title="Performance Reviews" role={user.role}>
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {user.role === 'Employee' ? 'My Evaluations History' : 'Employee Evaluation Console'}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
            {user.role === 'Employee' 
              ? 'Review ratings breakdown and feedback logs from reporting managers'
              : 'Audit performance scores, log ratings, and submit evaluations'}
          </p>
        </div>
      </div>

      {/* Role Navigation Tabs (Manager/Admin only) */}
      {user.role !== 'Employee' && (
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          <button
            onClick={() => {
              setActiveTab('pending');
              setSearchTerm('');
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Pending Evaluations ({pendingEvaluations.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('submitted');
              setSearchTerm('');
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'submitted'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Submitted Reviews ({filteredSubmittedReviews.length})
          </button>
        </div>
      )}

      {/* Filter Card */}
      {user.role !== 'Employee' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="p-5 bg-slate-50/20">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder={activeTab === 'pending' ? 'Search employees...' : 'Search employee or evaluator...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Core Listings Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-red-100 rounded-2xl text-red-650 flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
          <p className="font-bold text-sm">{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : user.role === 'Employee' ? (
        /* --- EMPLOYEE VIEW: READ-ONLY FEEDBACK LIST --- */
        reviews.length === 0 ? (
          <div className="bg-white py-16 text-center text-slate-400 border border-slate-100 rounded-2xl shadow-sm">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-sm">No performance evaluations received yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => {
              const avg = getAverageScore(rev);
              return (
                <div key={rev._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6">
                    <div className="flex items-center space-x-3.5 mb-4 sm:mb-0">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-black">
                        {rev.managerId?.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rev.managerId?.name || 'Assigned Manager'}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{rev.managerId?.designation || 'Reviewer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-400 font-semibold">EVALUATION DATE</p>
                        <p className="text-xs font-bold text-slate-700">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ScoreBadge score={avg} />
                    </div>
                  </div>

                  {/* Rating Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Technical</p>
                      <StarRating value={rev.technical} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Communication</p>
                      <StarRating value={rev.communication} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Teamwork</p>
                      <StarRating value={rev.teamwork} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Problem Solving</p>
                      <StarRating value={rev.problemSolving} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Leadership</p>
                      <StarRating value={rev.leadership} />
                    </div>
                  </div>

                  {/* Feedback comments */}
                  {rev.comments && (
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                      <div className="flex items-center space-x-1.5 text-xs text-indigo-650 font-bold mb-2 uppercase">
                        <MessageSquare className="w-4 h-4" />
                        <span>Evaluator Feedback Notes</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-slate-650 italic">
                        "{rev.comments}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'pending' ? (
        /* --- MANAGER/ADMIN VIEW: PENDING EVALUATIONS LIST --- */
        pendingEvaluations.length === 0 ? (
          <div className="bg-white py-16 text-center text-slate-400 border border-slate-100 rounded-2xl shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-sm">All employee evaluations are submitted! No pending reviews.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingEvaluations.map((emp) => (
              <div key={emp._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="w-10 h-10 bg-indigo-550 rounded-full flex items-center justify-center text-white font-extrabold">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{emp.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{emp.designation || 'Staff Member'}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Department:</span>
                  <span className="text-slate-700 font-bold">{emp.department || 'N/A'}</span>
                </div>
                <button
                  onClick={() => handleOpenEvaluate(emp)}
                  className="mt-5 w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Evaluation</span>
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* --- MANAGER/ADMIN VIEW: SUBMITTED REVIEWS TABLE --- */
        filteredSubmittedReviews.length === 0 ? (
          <div className="bg-white py-16 text-center text-slate-400 border border-slate-100 rounded-2xl shadow-sm">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-sm">No evaluations submitted yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Employee</th>
                    {user.role === 'Admin' && (
                      <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Evaluated By</th>
                    )}
                    <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Score</th>
                    <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Comments</th>
                    <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmittedReviews.map((rev) => {
                    const avg = getAverageScore(rev);
                    return (
                      <tr key={rev._id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Employee Name */}
                        <td className="p-4.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
                              {rev.employeeId?.name ? rev.employeeId.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">{rev.employeeId?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{rev.employeeId?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Evaluated By (Admin view only) */}
                        {user.role === 'Admin' && (
                          <td className="p-4.5">
                            <p className="text-xs font-bold text-slate-700 leading-tight">{rev.managerId?.name || 'HR Admin'}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{rev.managerId?.designation || 'Admin'}</p>
                          </td>
                        )}

                        {/* Date */}
                        <td className="p-4.5 text-xs font-semibold text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </td>

                        {/* Score Badge */}
                        <td className="p-4.5 text-center">
                          <ScoreBadge score={avg} />
                        </td>

                        {/* Comments */}
                        <td className="p-4.5 max-w-xs truncate text-xs font-medium text-slate-500 italic">
                          {rev.comments ? `"${rev.comments}"` : 'No comments provided.'}
                        </td>

                        {/* Actions */}
                        <td className="p-4.5 text-right">
                          <div className="flex justify-end space-x-2">
                            {(user.role === 'Admin' || (rev.managerId?._id === user._id || rev.managerId === user._id)) && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(rev)}
                                  title="Edit Review"
                                  className="w-8.5 h-8.5 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-650 hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(rev._id)}
                                  title="Delete Review"
                                  className="w-8.5 h-8.5 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-650 hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* --- FORM SUBMISSION MODAL OVERLAY --- */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingReview ? 'Edit Evaluation' : 'Performance Evaluation'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                  Rating: {selectedEmployee.name}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-center space-x-2.5 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Rating criteria cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Technical Skills</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Coding, algorithms, system architecture knowledge</p>
                  </div>
                  <StarRating 
                    value={ratings.technical} 
                    onChange={(val) => setRatings({ ...ratings, technical: val })} 
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Communication</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Clarity in discussions, status updates, emails</p>
                  </div>
                  <StarRating 
                    value={ratings.communication} 
                    onChange={(val) => setRatings({ ...ratings, communication: val })} 
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Team Collaboration</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Helpfulness, coordination, peer relationship</p>
                  </div>
                  <StarRating 
                    value={ratings.teamwork} 
                    onChange={(val) => setRatings({ ...ratings, teamwork: val })} 
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Problem Solving</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Debugging speed, logic, scaling edge cases</p>
                  </div>
                  <StarRating 
                    value={ratings.problemSolving} 
                    onChange={(val) => setRatings({ ...ratings, problemSolving: val })} 
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Leadership</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Mentoring, ownership, driving initiatives</p>
                  </div>
                  <StarRating 
                    value={ratings.leadership} 
                    onChange={(val) => setRatings({ ...ratings, leadership: val })} 
                  />
                </div>
              </div>

              {/* Comments Textarea */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Detailed Feedback Comments</label>
                <textarea
                  rows="4"
                  placeholder="Provide qualitative feedback outlining the employee's strengths and areas of improvements..."
                  value={ratings.comments}
                  onChange={(e) => setRatings({ ...ratings, comments: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder-slate-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm active:scale-95"
                >
                  {editingReview ? 'Save Changes' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReviewManagement;
