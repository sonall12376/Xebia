import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
          P
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Check your email</h3>
              <p className="text-sm text-slate-500 mb-6">
                A password reset link has been mock-sent to <span className="font-semibold text-slate-700">{email}</span>.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-150"
              >
                Resend email
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors duration-150"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
