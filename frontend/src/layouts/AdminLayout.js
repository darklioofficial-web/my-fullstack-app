import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, CheckCircle2, PlayCircle, Wallet, 
  ShieldCheck, UploadCloud, Gift, Settings, FileText, LogOut 
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CheckCircle2, label: 'Tasks', path: '/admin/tasks' },
    { icon: PlayCircle, label: 'Ads', path: '/admin/ads' },
    { icon: Wallet, label: 'Withdrawals', path: '/admin/withdrawals' },
    { icon: ShieldCheck, label: 'KYC', path: '/admin/kyc' },
    { icon: UploadCloud, label: 'Uploads', path: '/admin/uploads' },
    { icon: Gift, label: 'Referrals', path: '/admin/referrals' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: FileText, label: 'CMS', path: '/admin/cms' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed left-0 top-0 h-full" data-testid="admin-sidebar">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-heading font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                EarnKaro Student
              </h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              data-testid={`admin-nav-${item.label.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            data-testid="admin-logout-button"
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">
        <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-heading font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              EarnKaro Admin
            </span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-red-600"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <div className="md:p-8 p-4 md:pt-8 pt-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}