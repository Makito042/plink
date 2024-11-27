import { CreditCard, Package, Settings, ShoppingBag, User, Box, FileText, Users, BarChart2, Shield } from 'lucide-react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardAnalytics from '../components/DashboardAnalytics';
import VendorDashboard from '../components/VendorDashboard';
import { useEffect } from 'react';
import '../components/ProfileIcon.css';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect /admin/dashboard to /dashboard
  useEffect(() => {
    if (location.pathname === '/admin/dashboard') {
      window.location.href = '/dashboard';
    }
  }, [location]);

  const isVendor = user.role === 'vendor';
  const isAdmin = user.role === 'admin';
  const isSuperAdmin = user.role === 'superadmin';

  const renderNavItems = () => {
    const baseNavClass = "flex items-center space-x-2 p-3 rounded-lg transition-all";
    const activeNavClass = "bg-[#e6ffe6] text-primary";
    const inactiveNavClass = "text-gray-600 hover:bg-gray-50 hover:text-primary";

    if (isSuperAdmin || isAdmin) {
      return (
        <>
          <Link
            to="/dashboard"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard' ? activeNavClass : inactiveNavClass
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Analytics</span>
          </Link>
          <Link
            to="/dashboard/users"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/users' ? activeNavClass : inactiveNavClass
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          <Link
            to="/dashboard/vendors"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/vendors' ? activeNavClass : inactiveNavClass
            }`}
          >
            <Box className="w-5 h-5" />
            <span>Vendors</span>
          </Link>
          <Link
            to="/dashboard/orders"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/orders' ? activeNavClass : inactiveNavClass
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </Link>
          {isSuperAdmin && (
            <Link
              to="/dashboard/permissions"
              className={`${baseNavClass} ${
                location.pathname === '/dashboard/permissions' ? activeNavClass : inactiveNavClass
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Permissions</span>
            </Link>
          )}
          <Link
            to="/dashboard/profile"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/profile' ? activeNavClass : inactiveNavClass
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link
            to="/dashboard/settings"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/settings' ? activeNavClass : inactiveNavClass
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </>
      );
    }

    if (isVendor) {
      return (
        <>
          <Link
            to="/dashboard"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard' ? activeNavClass : inactiveNavClass
            }`}
          >
            <Box className="w-5 h-5" />
            <span>Products</span>
          </Link>
          <Link
            to="/dashboard/orders"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/orders' ? activeNavClass : inactiveNavClass
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </Link>
          <Link
            to="/dashboard/inventory"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/inventory' ? activeNavClass : inactiveNavClass
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
          <Link
            to="/dashboard/profile"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/profile' ? activeNavClass : inactiveNavClass
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link
            to="/dashboard/settings"
            className={`${baseNavClass} ${
              location.pathname === '/dashboard/settings' ? activeNavClass : inactiveNavClass
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </>
      );
    }

    // Customer navigation
    return (
      <>
        <Link
          to="/dashboard"
          className={`${baseNavClass} ${
            location.pathname === '/dashboard' ? activeNavClass : inactiveNavClass
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </Link>
        <Link
          to="/dashboard/payments"
          className={`${baseNavClass} ${
            location.pathname === '/dashboard/payments' ? activeNavClass : inactiveNavClass
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Payment Methods</span>
        </Link>
        <Link
          to="/dashboard/profile"
          className={`${baseNavClass} ${
            location.pathname === '/dashboard/profile' ? activeNavClass : inactiveNavClass
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Link
          to="/dashboard/settings"
          className={`${baseNavClass} ${
            location.pathname === '/dashboard/settings' ? activeNavClass : inactiveNavClass
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </>
    );
  };

  const renderDashboardContent = () => {
    // If we're at the root dashboard path, show the appropriate dashboard view
    if (location.pathname === '/dashboard') {
      if (isAdmin || isSuperAdmin) {
        return <DashboardAnalytics />;
      }
      if (isVendor) {
        return <VendorDashboard />;
      }
      // Default customer dashboard view
      return (
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
          {/* Add customer dashboard content here */}
        </div>
      );
    }
    
    // For other routes, let the router handle it through Outlet
    return <Outlet />;
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
        </div>
        <nav className="mt-4">
          {renderNavItems()}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderDashboardContent()}
      </div>
    </div>
  );
}