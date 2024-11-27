import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Save, Edit2, X, Clock, Activity, User, Shield } from 'lucide-react';
import { fetchProfile, updateProfile } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    reason?: string;
  }>;
  createdAt: string;
  lastLogin: string;
}

const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'superadmin':
      return 'bg-red-100 text-red-800';
    case 'user':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Profile: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    status: user?.status || 'active',
    statusReason: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching profile...');
      const data = await fetchProfile();
      console.log('Profile data:', data);
      setProfile(data);
      updateUser(data);
      setFormData(prev => ({
        ...prev,
        name: data.name,
        email: data.email
      }));
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const updatedUser = await updateProfile({
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setProfile(updatedUser);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      resetForm();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updatedUser = await updateProfile({
        ...formData,
        status: newStatus,
        statusReason: formData.statusReason
      });

      setProfile(updatedUser);
      updateUser(updatedUser);
      setSuccess(`Status updated to ${newStatus}`);
      setFormData(prev => ({ ...prev, statusReason: '' }));
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Failed to load profile data
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 bg-[#004d00] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-full">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{profile?.name || 'Loading...'}</h1>
                <p className="text-[#a3d5a3]">{profile?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Role and Status Section */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Information */}
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile?.role || 'user')}`}>
                    {profile?.role?.toUpperCase() || 'USER'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(profile?.status || 'active')}`}>
                    {profile?.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.createdAt ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true }) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.lastLogin ? formatDistanceToNow(new Date(profile.lastLogin), { addSuffix: true }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status History */}
        {profile?.statusHistory && profile.statusHistory.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Status History</h3>
              <button
                onClick={() => setShowStatusHistory(!showStatusHistory)}
                className="text-sm text-[#004d00] hover:text-[#003800]"
              >
                {showStatusHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>
            {showStatusHistory && (
              <div className="space-y-4">
                {profile.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full ${getStatusBadgeColor(history.status)}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(history.status)}`}>
                          {history.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(history.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      {history.reason && (
                        <p className="mt-1 text-sm text-gray-600">{history.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>

        {/* Admin Status Control */}
        {user?.role === 'admin' && profile?.id !== user?.id && (
          <div className="p-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status Control</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Reason</label>
                <textarea
                  name="statusReason"
                  value={formData.statusReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, statusReason: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  rows={2}
                  placeholder="Reason for status change..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('active')}
                  disabled={profile?.status === 'active'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate Account
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('inactive')}
                  disabled={profile?.status === 'inactive'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
