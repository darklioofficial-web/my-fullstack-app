import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else if (user) {
          navigate('/user/dashboard');
        } else {
          navigate('/login');
        }
      }, 2000);
    }
  }, [loading, user, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
      <div className="text-center animate-in fade-in duration-1000">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-sky-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-sky-600/30">
            <span className="text-4xl font-heading font-bold text-white">EK</span>
          </div>
        </div>
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">EarnKaro Student</h1>
        <p className="text-gray-600 font-medium">Start Earning Today!</p>
        <div className="mt-8">
          <div className="w-12 h-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}