import { CreditCard, Package, Settings, ShoppingBag, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserOrders } = useOrders();
  const userOrders = getUserOrders();

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
                  className="flex items-center space-x-2 p-3 rounded-lg bg-[#e6ffe6] text-[#004d00]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/dashboard/payments"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Methods</span>
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">My Orders</h1>
              <div className="space-y-4">
                {userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <Package className="w-10 h-10 text-[#004d00]" />
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">RWF {order.total.toLocaleString()}</p>
                        <span className={`text-sm ${
                          order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-[#004d00]">{userOrders.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
                <p className="text-3xl font-bold text-[#004d00]">
                  {userOrders.filter((o) => o.status === 'Processing').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
                <p className="text-3xl font-bold text-[#004d00]">
                  RWF {userOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}