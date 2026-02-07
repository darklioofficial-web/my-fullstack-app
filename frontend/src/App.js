import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import CMSPage from './pages/CMSPage';

// User Pages
import UserLayout from './layouts/UserLayout';
import Dashboard from './pages/user/Dashboard';
import Tasks from './pages/user/Tasks';
import Ads from './pages/user/Ads';
import Upload from './pages/user/Upload';
import Wallet from './pages/user/Wallet';
import KYC from './pages/user/KYC';
import Referrals from './pages/user/Referrals';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminAds from './pages/admin/AdminAds';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminKYC from './pages/admin/AdminKYC';
import AdminUploads from './pages/admin/AdminUploads';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCMS from './pages/admin/AdminCMS';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!adminOnly && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="ads" element={<Ads />} />
            <Route path="upload" element={<Upload />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="uploads" element={<AdminUploads />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="cms" element={<AdminCMS />} />
          </Route>
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;