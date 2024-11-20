import { CreditCard, Package, Settings, ShoppingBag, User } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Not Authenticated</h2>
          <p className="mt-2 text-gray-600">Please log in to view your dashboard.</p>
          <Link to="/login" className="mt-4 inline-block bg-[#004d00] text-white px-4 py-2 rounded-lg hover:bg-[#003300]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-[#004d00] rounded-full p-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    location.pathname === '/dashboard'
                      ? 'bg-[#e6ffe6] text-[#004d00]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    location.pathname === '/dashboard/profile'
                      ? 'bg-[#e6ffe6] text-[#004d00]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/dashboard/payments"
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    location.pathname === '/dashboard/payments'
                      ? 'bg-[#e6ffe6] text-[#004d00]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Methods</span>
                </Link>
                <Link
                  to="/dashboard/settings"
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    location.pathname === '/dashboard/settings'
                      ? 'bg-[#e6ffe6] text-[#004d00]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}