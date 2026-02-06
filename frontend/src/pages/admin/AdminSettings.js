import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.admin.getSettings();
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.admin.updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-settings">
      <div className="mb-8"><h1 className="text-3xl font-heading font-bold">App Settings</h1></div>
      <div className="bg-card rounded-xl border shadow-sm p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium mb-2">Min Withdrawal (₹)</label><Input type="number" value={settings.min_withdrawal || 500} onChange={(e) => setSettings({...settings, min_withdrawal: parseFloat(e.target.value)})} data-testid="min-withdrawal-input" /></div><div><label className="block text-sm font-medium mb-2">Max Withdrawal (₹)</label><Input type="number" value={settings.max_withdrawal || 5000} onChange={(e) => setSettings({...settings, max_withdrawal: parseFloat(e.target.value)})} /></div><div><label className="block text-sm font-medium mb-2">Referral Bonus (₹)</label><Input type="number" value={settings.referral_bonus || 20} onChange={(e) => setSettings({...settings, referral_bonus: parseFloat(e.target.value)})} /></div><div><label className="block text-sm font-medium mb-2">Welcome Bonus (₹)</label><Input type="number" value={settings.welcome_bonus || 10} onChange={(e) => setSettings({...settings, welcome_bonus: parseFloat(e.target.value)})} /></div><div><label className="block text-sm font-medium mb-2">Ad Reward (₹)</label><Input type="number" value={settings.ad_reward || 5} onChange={(e) => setSettings({...settings, ad_reward: parseFloat(e.target.value)})} /></div><div><label className="block text-sm font-medium mb-2">Upload Reward (₹)</label><Input type="number" value={settings.upload_reward || 1000} onChange={(e) => setSettings({...settings, upload_reward: parseFloat(e.target.value)})} /></div></div><Button onClick={handleUpdate} className="mt-6" data-testid="save-settings-button">Save All Settings</Button></div>
    </div>
  );
}
