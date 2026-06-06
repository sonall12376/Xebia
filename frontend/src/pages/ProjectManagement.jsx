import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from './Dashboards';
import {
  Search, Plus, Edit2, Trash2, X, AlertCircle, AlertTriangle,
  Calendar, Briefcase, User, Check, Users, ShieldAlert, Clock
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const ProjectManagement = () => {
  const { user, token } = useAuth();

  // Data State
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null); // null for Add, project object for Edit
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    priority: 'Medium',
    managerId: '',
    employeeIds: []
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch projects
      const projRes = await fetch(`${API_URL}/projects`, { headers });
      if (!projRes.ok) throw new Error('Failed to fetch projects list');
      const projData = await projRes.json();
      setProjects(projData);

      // Fetch lookups (Employees and Managers)
      const [empRes, mgrRes] = await Promise.all([
        fetch(`${API_URL}/projects/employees`, { headers }),
        fetch(`${API_URL}/projects/managers`, { headers })
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }
      if (mgrRes.ok) {
        const mgrData = await mgrRes.json();
        setManagers(mgrData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Alert Timout helper
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filtered projects
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = 
      proj.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || proj.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Check if current user has permission to write/edit/delete the project
  const canManageProject = (project) => {
    if (!project) return true; // Default for Add
    if (user?.role === 'Admin') return true;
    
    // For Managers, check ownership: comparing string IDs
    const projManagerId = project.managerId?._id || project.managerId;
    return user?.role === 'Manager' && projManagerId === user?._id;
  };

  // Open Add Modal
  const handleAddClick = () => {
    setCurrentProject(null);
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      status: 'Not Started',
      priority: 'Medium',
      managerId: user?.role === 'Manager' ? user._id : '',
      employeeIds: []
    });
    setFormError('');
    setEmployeeSearchTerm('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleEditClick = (project) => {
    if (!canManageProject(project)) {
      alert('You are not authorized to modify this project.');
      return;
    }
    setCurrentProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().substring(0, 10) : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().substring(0, 10) : '',
      status: project.status || 'Not Started',
      priority: project.priority || 'Medium',
      managerId: project.managerId?._id || project.managerId || '',
      employeeIds: project.employeeIds ? project.employeeIds.map(e => e._id || e) : []
    });
    setFormError('');
    setEmployeeSearchTerm('');
    setIsFormOpen(true);
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle employee selection
  const handleEmployeeToggle = (empId) => {
    setFormData(prev => {
      const exists = prev.employeeIds.includes(empId);
      if (exists) {
        return {
          ...prev,
          employeeIds: prev.employeeIds.filter(id => id !== empId)
        };
      } else {
        return {
          ...prev,
          employeeIds: [...prev.employeeIds, empId]
        };
      }
    });
  };

  // Submit Form (Create / Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    // Form validations
    if (!formData.name.trim()) {
      setFormError('Project name is required');
      setFormSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Project description is required');
      setFormSubmitting(false);
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setFormError('Start and end dates are required');
      setFormSubmitting(false);
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormError('End date must be after the start date');
      setFormSubmitting(false);
      return;
    }
    if (user?.role === 'Admin' && !formData.managerId) {
      setFormError('Please select a project manager');
      setFormSubmitting(false);
      return;
    }

    try {
      const url = currentProject 
        ? `${API_URL}/projects/${currentProject._id}` 
        : `${API_URL}/projects`;
      
      const method = currentProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      setSuccessMessage(
        currentProject 
          ? `Successfully saved changes for project "${formData.name}".`
          : `Successfully created project "${formData.name}".`
      );

      setIsFormOpen(false);
      fetchData(); // Refresh projects list
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Prompt
  const handleDeleteClick = (project) => {
    if (!canManageProject(project)) {
      alert('You are not authorized to delete this project.');
      return;
    }
    setDeleteTargetId(project._id);
    setDeleteTargetName(project.name);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${deleteTargetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to soft-delete project');
      }
      setSuccessMessage(`Project "${deleteTargetName}" has been successfully soft-deleted (historical records preserved).`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

  // Filter employees lookup list
  const filteredEmployeesLookup = employees.filter(emp => 
    emp.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Project Board" role={user?.role}>
      {/* Title Header area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Board</h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
            Track objectives, priority status, and employee assignments
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 mr-1.5" />
          Create Project
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center space-x-3 text-emerald-800 animate-fade-in shadow-sm">
          <Check className="w-5 h-5 flex-shrink-0 bg-emerald-100 p-0.5 rounded-full text-emerald-600" />
          <span className="text-xs font-bold">{successMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        
        {/* Top filter tabs (Status lanes selector) */}
        <div className="border-b border-slate-100 flex flex-wrap bg-slate-50/50 p-1.5">
          {['All', 'Not Started', 'In Progress', 'Completed', 'On Hold'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
              {statusFilter === status && (
                <span className="ml-1.5 bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded-full text-[10px]">
                  {filteredProjects.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Input selectors search and priority */}
        <div className="p-5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by project name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 font-semibold"
            />
          </div>

          <div className="flex gap-3">
            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {(searchTerm || priorityFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('All');
                  setStatusFilter('All');
                }}
                className="px-4 py-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects List Container */}
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
            Retry Loading
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-sm">No projects found matching the criteria.</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.map((proj) => {
            const daysLeft = Math.ceil((new Date(proj.endDate) - Date.now()) / (1000 * 60 * 60 * 24));
            const isManaged = canManageProject(proj);

            return (
              <div 
                key={proj._id} 
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Header Tag Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      proj.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : proj.status === 'In Progress' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse'
                        : proj.status === 'On Hold'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {proj.status}
                    </span>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      proj.priority === 'High' 
                        ? 'bg-red-50 text-red-700 border border-red-100' 
                        : proj.priority === 'Medium' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-250'
                    }`}>
                      {proj.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-md font-bold text-slate-900 leading-tight mb-2">{proj.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-5">{proj.description}</p>

                  <div className="space-y-2.5 pt-4.5 border-t border-slate-100">
                    {/* Dates */}
                    <div className="flex items-center text-[11px] text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>
                        {new Date(proj.startDate).toLocaleDateString()} - {new Date(proj.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Manager name */}
                    <div className="flex items-center text-[11px] text-slate-500 font-semibold">
                      <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>Mgr: <strong className="text-slate-800">{proj.managerId?.name || 'Unassigned'}</strong></span>
                    </div>

                    {/* Timeline Warning banner if not completed */}
                    {proj.status !== 'Completed' && daysLeft > 0 && daysLeft <= 10 && (
                      <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg flex items-center text-[10px] text-amber-800 font-bold">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600 flex-shrink-0" />
                        <span>Deadline approaching: {daysLeft} days left</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Avatars & Action Buttons Footer */}
                <div className="px-6 py-4.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  {/* Staff initial avatars */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {proj.employeeIds && proj.employeeIds.length > 0 ? (
                      proj.employeeIds.map((emp) => (
                        <div 
                          key={emp._id || emp} 
                          title={`${emp.name || 'Team member'} (${emp.email || ''})`}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center cursor-default shadow-sm"
                        >
                          {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold italic">No reports assigned</span>
                    )}
                  </div>

                  {/* Edit/Delete actions */}
                  {isManaged ? (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleEditClick(proj)}
                        title="Edit Project"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all cursor-pointer bg-white shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(proj)}
                        title="Delete Project (Soft Delete)"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer bg-white shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Read Only
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- MODALS ----------------- */}

      {/* Project Form Modal (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {currentProject ? `Edit Project: ${currentProject.name}` : 'Create New Project'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                  Set objective timelines and delegate workforce tasks
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="col-span-full p-4.5 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-850 text-xs font-semibold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-650" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Project Name */}
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Website Redesign Q3"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Description */}
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Scope *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Provide description of goals, deliverables, and expectations..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-750"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-750"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Manager Selector (Shown to Admin only, Managers are pre-assigned) */}
                {user?.role === 'Admin' ? (
                  <div className="col-span-full border-t border-slate-100 pt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Manager Assignment *</label>
                    <select
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-750"
                    >
                      <option value="">-- Choose Manager --</option>
                      {managers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {/* Employees Multi-select assignment checklist */}
                <div className="col-span-full border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Assign Employee Team Members ({formData.employeeIds.length} Selected)
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">Check to assign</span>
                  </div>

                  {/* Search box for checklist */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter employees list by name, email, department..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  {/* Checklist container */}
                  <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto divide-y divide-slate-150">
                    {filteredEmployeesLookup.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center font-semibold">No matching employees found.</p>
                    ) : (
                      filteredEmployeesLookup.map((emp) => {
                        const isChecked = formData.employeeIds.includes(emp._id);

                        return (
                          <div 
                            key={emp._id}
                            onClick={() => handleEmployeeToggle(emp._id)}
                            className="flex items-center justify-between py-2 px-1 hover:bg-slate-100/60 rounded-md transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-extrabold text-[10px]">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 leading-tight">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{emp.email} {emp.department && `• ${emp.department}`}</p>
                              </div>
                            </div>
                            <div className={`w-4.5 h-4.5 border rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-250'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
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
                  {currentProject ? 'Save Changes' : 'Create Project'}
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
                <h3 className="text-md font-black text-slate-900">Soft-Delete Project</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical records preserved</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-slate-800">{deleteTargetName}</strong>? 
              This will remove the project from active dashboards and project board listings. 
              <br /><br />
              *Note: Associated employee performance evaluations and historical review audit logs will remain intact.*
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
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProjectManagement;
