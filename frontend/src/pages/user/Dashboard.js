import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { TrendingUp, Wallet, CheckCircle, Gift } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.getDashboard();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: "Today's Earning", value: `₹${data?.today_earning?.toFixed(2) || 0}`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Weekly Earning', value: `₹${data?.weekly_earning?.toFixed(2) || 0}`, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Total Earning', value: `₹${data?.total_earning?.toFixed(2) || 0}`, icon: Wallet, color: 'text-purple-600' },
    { label: 'Completed Tasks', value: data?.completed_tasks || 0, icon: CheckCircle, color: 'text-sky-600' },
    { label: 'Referral Bonus', value: `₹${data?.referral_bonus?.toFixed(2) || 0}`, icon: Gift, color: 'text-amber-500' }
  ];

  const chartData = data?.weekly_chart ? Object.keys(data.weekly_chart).map(day => ({
    day,
    earning: data.weekly_chart[day]
  })) : [];

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="user-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Here's your earnings overview</p>
      </div>

      <div className="mb-8">
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-6 shadow-lg shadow-sky-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sky-100 text-sm font-medium mb-1">Wallet Balance</p>
              <p className="text-4xl font-heading font-bold text-white" data-testid="wallet-balance">
                ₹{data?.wallet_balance?.toFixed(2) || 0}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow" data-testid={`stat-${stat.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Weekly Earnings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="earning" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}