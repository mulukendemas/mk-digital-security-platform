import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/logo';
import { authService } from '@/lib/api-service';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSubmitted(true);
      toast.success('Password reset instructions have been sent to your email');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast.error(error.response?.data?.detail || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
          <Logo className="h-12 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to your email address.
          </p>
          <Link
            to="/admin/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-12 mb-6" />
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter your email address to receive reset instructions
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/admin/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;