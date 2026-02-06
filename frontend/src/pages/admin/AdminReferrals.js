import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function AdminReferrals() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bonus, setBonus] = useState('20');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.admin.getSettings();
      setSettings(response.data);
      setBonus(response.data.referral_bonus?.toString() || '20');
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.admin.updateSettings({ referral_bonus: parseFloat(bonus) });
      toast.success('Referral bonus updated');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-referrals">
      <div className="mb-8"><h1 className="text-3xl font-heading font-bold">Referral Management</h1></div>
      <div className="bg-card rounded-xl border shadow-sm p-6"><h2 className="text-xl font-bold mb-4">Referral Control</h2><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">Referral Bonus (₹)</label><Input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} data-testid="referral-bonus-input" /></div><Button onClick={handleUpdate} data-testid="save-referral-settings">Save Settings</Button></div></div>
    </div>
  );
}
