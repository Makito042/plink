import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [loginType, setLoginType] = useState<'vendor' | 'customer'>('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' as 'user' | 'vendor'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Update role based on login type
      const loginData = {
        ...formData,
        role: loginType === 'vendor' ? 'vendor' : 'user'
      };

      console.log('Attempting login with:', { ...loginData, password: '[REDACTED]' });
      const response = await login(loginData);
      
      if (!response || !response.tokens || !response.tokens.accessToken) {
        throw new Error('Invalid response from server');
      }

      // Check vendor-specific conditions
      if (response.user.role === 'vendor') {
        if (response.user.status !== 'active') {
          throw new Error('Your vendor account is pending approval. Please contact support for more information.');
        }
        if (!response.user.storeDetails?.active) {
          throw new Error('Your store has not been activated yet. Please wait for admin approval.');
        }
      }

      // Store user data and tokens
      authLogin(response.tokens.accessToken, response.user);
      
      // Redirect based on user role
      switch (response.user.role) {
        case 'vendor':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to PharmaLink
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Type Selector */}
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => {
              setLoginType('customer');
              setFormData(prev => ({ ...prev, role: 'user' }));
              setError('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
              loginType === 'customer'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('vendor');
              setFormData(prev => ({ ...prev, role: 'vendor' }));
              setError('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border ${
              loginType === 'vendor'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Vendor
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={`${loginType === 'vendor' ? 'Vendor' : 'Customer'} email`}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Don't have an account? Register
              </Link>
            </div>
            {loginType === 'vendor' && (
              <div className="text-sm">
                <Link to="/vendor/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Register as Vendor
                </Link>
              </div>
            )}
          </div>
        </form>

        {/* Admin Login Link */}
        <div className="mt-4 text-center">
          <Link to="/admin/login" className="text-sm text-gray-600 hover:text-indigo-500">
            Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}