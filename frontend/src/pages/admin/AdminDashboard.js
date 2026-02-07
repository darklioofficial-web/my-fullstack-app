import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.admin.getDashboard();
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
    { label: 'Total Users', value: data?.total_users || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Users', value: data?.active_users || 0, icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Today Users', value: data?.today_users || 0, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Weekly Users', value: data?.weekly_users || 0, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Monthly Users', value: data?.monthly_users || 0, icon: TrendingUp, color: 'bg-pink-100 text-pink-600' },
    
    { label: 'Total Distributed', value: `₹${data?.total_distributed?.toFixed(2) || 0}`, icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
    { label: 'Today Earnings', value: `₹${data?.today_earnings?.toFixed(2) || 0}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Weekly Earnings', value: `₹${data?.weekly_earnings?.toFixed(2) || 0}`, icon: DollarSign, color: 'bg-teal-100 text-teal-600' },
    { label: 'Monthly Earnings', value: `₹${data?.monthly_earnings?.toFixed(2) || 0}`, icon: DollarSign, color: 'bg-cyan-100 text-cyan-600' },
    
    { label: 'Pending Withdrawals', value: data?.pending_withdrawals || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Approved Withdrawals', value: data?.approved_withdrawals_count || 0, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    
    { label: 'Pending KYC', value: data?.pending_kyc || 0, icon: Clock, color: 'bg-orange-100 text-orange-600' },
    { label: 'Approved KYC', value: data?.approved_kyc || 0, icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
    
    { label: 'Pending Uploads', value: data?.pending_uploads || 0, icon: Clock, color: 'bg-red-100 text-red-600' },
    { label: 'Approved Uploads', value: data?.approved_uploads || 0, icon: CheckCircle, color: 'bg-purple-100 text-purple-600' }
  ];

  const chartData = data?.weekly_earnings_chart ? Object.keys(data.weekly_earnings_chart).map(day => ({
    day,
    earning: data.weekly_earnings_chart[day]
  })) : [];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl border border-border/50 shadow-sm p-6" data-testid={`admin-stat-${stat.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Weekly Earnings Distribution</h2>
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

      {data?.recent_withdrawals?.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Recent Withdrawals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-t border-border">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{withdrawal.user_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">₹{withdrawal.amount}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{withdrawal.method}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        withdrawal.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}