import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from './Dashboards';
import {
  Search, Plus, Edit2, Trash2, X, AlertCircle, AlertTriangle,
  Mail, Phone, Calendar, Briefcase, UserCheck, Check, UserPlus
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const EmployeeManagement = () => {
  const { token } = useAuth();
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); // null for "Add", employee object for "Edit"
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    designation: '',
    contact: '',
    profilePicture: '',
    managerId: '',
    joiningDate: ''
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Success message notification state
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, mgrRes] = await Promise.all([
        fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/users/managers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!empRes.ok) throw new Error('Failed to fetch employee directory');
      if (!mgrRes.ok) throw new Error('Failed to fetch manager list');

      const empData = await empRes.json();
      const mgrData = await mgrRes.json();

      setEmployees(empData);
      setManagers(mgrData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Alert/Notification Timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Unique departments for filtering dropdown
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept ? emp.department === selectedDept : true;
    const matchesRole = selectedRole ? emp.role === selectedRole : true;

    return matchesSearch && matchesDept && matchesRole;
  });

  // Open Add Form
  const handleAddClick = () => {
    setCurrentEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Employee',
      department: '',
      designation: '',
      contact: '',
      profilePicture: '',
      managerId: '',
      joiningDate: new Date().toISOString().substring(0, 10)
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleEditClick = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '', // Empty password implies "do not change"
      role: employee.role || 'Employee',
      department: employee.department || '',
      designation: employee.designation || '',
      contact: employee.contact || '',
      profilePicture: employee.profilePicture || '',
      managerId: employee.managerId?._id || employee.managerId || '',
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().substring(0, 10) : ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form Submit (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    // Basic Validation
    if (!formData.name.trim()) {
      setFormError('Name is required');
      setFormSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      setFormSubmitting(false);
      return;
    }
    if (!currentEmployee && !formData.password) {
      setFormError('Password is required for new accounts');
      setFormSubmitting(false);
      return;
    }

    try {
      const url = currentEmployee 
        ? `${API_URL}/users/${currentEmployee._id}` 
        : `${API_URL}/users`;
      
      const method = currentEmployee ? 'PUT' : 'POST';

      // Clean up body (do not send empty password on edit, do not send managerId if role is not Employee)
      const submitBody = { ...formData };
      if (currentEmployee && !submitBody.password) {
        delete submitBody.password;
      }
      if (submitBody.role !== 'Employee') {
        submitBody.managerId = null;
      } else if (!submitBody.managerId) {
        submitBody.managerId = null;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitBody)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      setSuccessMessage(
        currentEmployee 
          ? `Successfully updated details for ${formData.name}.`
          : `Successfully created user account for ${formData.name}.`
      );
      
      setIsFormOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Dialog
  const handleDeleteClick = (employee) => {
    setDeleteTargetId(employee._id);
    setDeleteTargetName(employee.name);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${deleteTargetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      setSuccessMessage(`User "${deleteTargetName}" has been successfully removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  return (
    <DashboardLayout title="Employee Management" role="Admin">
      {/* Upper Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
            Manage system permissions, roles, and profiles
          </p>
        </div>
        
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center space-x-3 text-emerald-800 animate-fade-in shadow-sm">
          <Check className="w-5 h-5 flex-shrink-0 bg-emerald-100 p-0.5 rounded-full text-emerald-600" />
          <span className="text-xs font-bold">{successMessage}</span>
        </div>
      )}

      {/* Main Directory Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 font-semibold"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="Manager">Managers</option>
              <option value="Employee">Employees</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedDept || selectedRole) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('');
                  setSelectedRole('');
                }}
                className="px-4 py-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="font-bold text-sm">{error}</p>
            <button 
              onClick={fetchData} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-sm">No employees found matching the filters.</p>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Role & Dept</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Manager</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="p-4.5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & Email */}
                    <td className="p-4.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                          {emp.profilePicture ? (
                            <img src={emp.profilePicture} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            emp.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{emp.name}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1" />
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="p-4.5">
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{emp.designation || 'Staff Member'}</p>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            emp.role === 'Manager' 
                              ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}>
                            {emp.role}
                          </span>
                          {emp.department && (
                            <span className="text-xs text-slate-400 font-bold">
                              • {emp.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Manager Name */}
                    <td className="p-4.5">
                      {emp.role === 'Employee' ? (
                        emp.managerId ? (
                          <div className="flex items-center space-x-1.5 text-slate-700">
                            <UserCheck className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold">{emp.managerId.name || emp.managerId}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-500 font-bold italic bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                            No Manager Assigned
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">—</span>
                      )}
                    </td>

                    {/* Contact Number */}
                    <td className="p-4.5">
                      {emp.contact ? (
                        <div className="flex items-center space-x-1 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold">{emp.contact}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-350 italic">Not provided</span>
                      )}
                    </td>

                    {/* Joining Date */}
                    <td className="p-4.5">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold">
                          {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Action Items */}
                    <td className="p-4.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleEditClick(emp)}
                          title="Edit Profile"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(emp)}
                          title="Delete User"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {currentEmployee ? `Edit Employee: ${currentEmployee.name}` : 'Add New Employee'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                  {currentEmployee ? 'Modify system registry credentials' : 'Register new portal profile credentials'}
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="col-span-full p-4.5 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-800 text-xs font-semibold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder="Jane Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder="jane.doe@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Password {currentEmployee ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!currentEmployee}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder={currentEmployee ? '••••••••' : 'Password password123'}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portal Access Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700"
                  >
                    <option value="Employee">Employee (Standard User)</option>
                    <option value="Manager">Manager (Approver)</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder="Engineering, Sales, HR..."
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation / Title</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder="Software Engineer..."
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder="9876543210"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700"
                  />
                </div>

                {/* Profile Picture URL */}
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profile Picture Image URL</label>
                  <input
                    type="text"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                {/* Manager Selection (Shown ONLY for Employees) */}
                {formData.role === 'Employee' && (
                  <div className="col-span-full border-t border-slate-100 pt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Assign Reporting Manager
                    </label>
                    <select
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700"
                    >
                      <option value="">-- Select Reporting Manager (None) --</option>
                      {managers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-wide">
                      Select the supervisor authorized to log performance feedback.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl transition-all duration-150 shadow-md cursor-pointer flex items-center"
                >
                  {formSubmitting && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {currentEmployee ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden p-6 animate-scale-up">
            <div className="flex items-center space-x-3.5 mb-4.5">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-black text-slate-900">Confirm Account Deletion</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Warning: This action is permanent</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-slate-800">{deleteTargetName}</strong>? All associated profiles, attendance check-ins, and assignments will be cleaned, and manager references will be detached.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all duration-150 shadow-md cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployeeManagement;
