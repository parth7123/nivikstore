import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {

  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const loadUserProfile = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });
      
      if (response.data.success) {
        setUserData(response.data.user);
        setFormData({ name: response.data.user.name, email: response.data.user.email });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserProfile();
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        backendUrl + '/api/user/profile/update',
        { name: formData.name, email: formData.email },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setUserData(response.data.user);
        setEditMode(false);
        loadUserProfile();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/user/profile/change-password',
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setPasswordMode(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  }

  if (loading) {
    return (
      <div className='border-t pt-16 flex justify-center items-center min-h-[400px]'>
        <p className='text-gray-500'>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      {/* Profile Information Section */}
      <div className='max-w-2xl'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-medium text-gray-800'>Personal Information</h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className='px-4 py-2 backdrop-blur-xl bg-black/90 text-white text-sm hover:bg-black transition-all shadow-lg rounded-sm'
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editMode ? (
          <div className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded-xl p-6'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Name</p>
                <p className='text-base text-gray-800'>{userData.name}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Email</p>
                <p className='text-base text-gray-800'>{userData.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded-xl p-6 space-y-4'>
            <div>
              <label className='block text-sm text-gray-500 mb-1'>Name</label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='w-full px-3 py-2 backdrop-blur-xl bg-white/40 border border-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white/60'
                required
              />
            </div>
            <div>
              <label className='block text-sm text-gray-500 mb-1'>Email</label>
              <input
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='w-full px-3 py-2 backdrop-blur-xl bg-white/40 border border-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white/60'
                required
              />
            </div>
            <div className='flex gap-3'>
              <button
                type='submit'
                className='px-6 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors rounded-sm'
              >
                Save Changes
              </button>
              <button
                type='button'
                onClick={() => {
                  setEditMode(false);
                  setFormData({ name: userData.name, email: userData.email });
                }}
                className='px-6 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition-colors rounded-sm'
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Section */}
      <div className='max-w-2xl mt-12'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-medium text-gray-800'>Change Password</h2>
          {!passwordMode && (
            <button
              onClick={() => setPasswordMode(true)}
              className='px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition-colors rounded-sm backdrop-blur-sm bg-white/30'
            >
              Change Password
            </button>
          )}
        </div>

        {passwordMode && (
          <form onSubmit={handleChangePassword} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded-xl p-6 space-y-4'>
            <div>
              <label className='block text-sm text-gray-500 mb-1'>Current Password</label>
              <input
                type='password'
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className='w-full px-3 py-2 backdrop-blur-xl bg-white/40 border border-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white/60'
                required
              />
            </div>
            <div>
              <label className='block text-sm text-gray-500 mb-1'>New Password</label>
              <input
                type='password'
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className='w-full px-3 py-2 backdrop-blur-xl bg-white/40 border border-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white/60'
                required
                minLength={8}
              />
              <p className='text-xs text-gray-400 mt-1'>Password must be at least 8 characters long</p>
            </div>
            <div>
              <label className='block text-sm text-gray-500 mb-1'>Confirm New Password</label>
              <input
                type='password'
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className='w-full px-3 py-2 backdrop-blur-xl bg-white/40 border border-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white/60'
                required
                minLength={8}
              />
            </div>
            <div className='flex gap-3'>
              <button
                type='submit'
                className='px-6 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors rounded-sm'
              >
                Update Password
              </button>
              <button
                type='button'
                onClick={() => {
                  setPasswordMode(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className='px-6 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition-colors rounded-sm'
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile

