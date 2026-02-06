import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, PlayCircle, UploadCloud, Wallet, ShieldCheck, Users, UserCircle } from 'lucide-react';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard' },
    { icon: CheckCircle2, label: 'Tasks', path: '/user/tasks' },
    { icon: PlayCircle, label: 'Ads', path: '/user/ads' },
    { icon: UploadCloud, label: 'Upload', path: '/user/upload' },
    { icon: Wallet, label: 'Wallet', path: '/user/wallet' },
    { icon: ShieldCheck, label: 'KYC', path: '/user/kyc' },
    { icon: Users, label: 'Referrals', path: '/user/referrals' },
    { icon: UserCircle, label: 'Profile', path: '/user/profile' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border z-50" data-testid="bottom-navigation">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-3 transition-all ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="fixed top-4 left-4 right-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="bg-white/90 backdrop-blur-lg rounded-full px-4 py-2 shadow-sm border border-border">
            <span className="text-sm font-semibold text-primary">EarnKaro Student</span>
          </div>
          
          <div className="flex gap-2">
            {navItems.slice(4).map((item) => (
              <button
                key={item.path}
                data-testid={`header-${item.label.toLowerCase()}`}
                onClick={() => navigate(item.path)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-white/90 backdrop-blur-lg text-muted-foreground hover:text-primary border border-border'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}