import { ShoppingCart, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { items } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#004d00] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl">PharmaLink</Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-[#66cc66]">Home</Link>
            <Link to="/about" className="hover:text-[#66cc66]">About</Link>
            <div className="relative group">
              <button className="hover:text-[#66cc66]">Categories</button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 
                opacity-0 invisible transition-all duration-300 delay-500 
                group-hover:opacity-100 group-hover:visible">
                {/* Add your category links here */}
                <Link to="/category/medicines" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Medicines</Link>
                <Link to="/category/equipment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Medical Equipment</Link>
                <Link to="/category/supplies" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Medical Supplies</Link>
              </div>
            </div>
            <Link to="/contact" className="hover:text-[#66cc66]">Contact</Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="relative hover:text-[#66cc66]">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-[#66cc66]">
                    <User className="h-6 w-6" />
                    <span>{user?.name || 'Account'}</span>
                  </button>
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 
                             opacity-0 invisible transform -translate-y-2
                             group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                             transition-all duration-200 ease-in-out
                             hover:opacity-100 hover:visible hover:translate-y-0"
                  >
                    {user?.role === 'superadmin' ? (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Superadmin Dashboard</Link>
                    ) : user?.role === 'admin' ? (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>
                    ) : (
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="hover:text-[#66cc66]">Login</Link>
                <Link to="/register" className="bg-white text-[#004d00] px-4 py-2 rounded-md hover:bg-[#f2f2f2]">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}