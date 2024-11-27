import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import { Users, Settings, List, BarChart, DollarSign, Package, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { fetchAdminStats } from '../services/api';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  totalProducts: number;
  pendingOrders: number;
  systemHealth: {
    status: string;
    lastBackup: string;
    serverLoad: number;
    lastError: string | null;
  };
  recentActivity: {
    newUsers: number;
    recentOrders: number;
  };
  userStats: {
    customers: number;
    admins: number;
    inactiveUsers: number;
  };
}

const AdminConsole: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    systemHealth: {
      status: 'Healthy',
      lastBackup: '-',
      serverLoad: 0,
      lastError: null
    },
    recentActivity: {
      newUsers: 0,
      recentOrders: 0
    },
    userStats: {
      customers: 0,
      admins: 0,
      inactiveUsers: 0
    }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    loadStats();
  }, []);

  const menuItems = [
    ...(user?.role === 'superadmin' ? [
      { name: 'Admin Management', path: 'admins', icon: <Users className="w-5 h-5" /> },
    ] : []),
    { name: 'User Management', path: 'users', icon: <Users className="w-5 h-5" /> },
    { name: 'System Settings', path: 'settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'System Logs', path: 'logs', icon: <Activity className="w-5 h-5" /> },
  ];

  // Debug log to check user data
  console.log('AdminConsole - Current user:', user);

  // Check if user exists and has admin role
  if (!user) {
    console.log('No user found');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Define admin roles - must match backend enum
  const adminRoles = ['admin', 'superadmin', 'superuser'];
  
  // Separate check for admin role
  if (!adminRoles.includes(user.role || '')) {
    console.log('User role:', user.role);
    console.log('Allowed roles:', adminRoles);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You do not have permission to access this page. Your role: {user.role}
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {user?.role === 'superadmin' ? 'Superadmin Console' : 'Admin Console'}
          </h2>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                location.pathname === `/admin/${item.path}` ? 'bg-gray-100' : ''
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-12 h-12 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Total Users</h3>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="w-12 h-12 text-green-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Total Products</h3>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-12 h-12 text-yellow-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Total Revenue</h3>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
