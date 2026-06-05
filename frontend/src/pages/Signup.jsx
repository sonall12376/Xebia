import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase, Phone, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    designation: '',
    contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name || !formData.email || !formData.password) {
      setValidationError('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await register(formData);
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'Manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      console.error('Registration submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
          P
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {(validationError || error) && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-red-700">
                  {validationError || error}
                </span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="•••••••• (min 6 chars)"
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Organizational Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Department
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                    className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="designation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Designation
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="contact" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Contact Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
