import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editAd, setEditAd] = useState(null);
  const [formData, setFormData] = useState({ title: '', link: '', duration: '', reward: '', active: true });

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    try {
      const response = await api.admin.getAds();
      setAds(response.data);
    } catch (error) {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editAd) {
        await api.admin.updateAd(editAd.id, formData);
        toast.success('Ad updated');
      } else {
        await api.admin.createAd(formData);
        toast.success('Ad created');
      }
      setShowDialog(false);
      setEditAd(null);
      setFormData({ title: '', link: '', duration: '', reward: '', active: true });
      fetchAds();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this ad?')) {
      try {
        await api.admin.deleteAd(id);
        toast.success('Ad deleted');
        fetchAds();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-ads">
      <div className="mb-8 flex justify-between"><h1 className="text-3xl font-heading font-bold">Ads Management</h1><Button onClick={() => { setShowDialog(true); setEditAd(null); }} data-testid="create-ad-btn">Create Ad</Button></div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <table className="w-full">
          <thead className="bg-secondary/50"><tr><th className="px-4 py-3 text-left text-sm">Title</th><th className="px-4 py-3 text-left text-sm">Duration</th><th className="px-4 py-3 text-left text-sm">Reward</th><th className="px-4 py-3 text-left text-sm">Active</th><th className="px-4 py-3 text-left text-sm">Actions</th></tr></thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id} className="border-t" data-testid={`ad-${ad.id}`}><td className="px-4 py-3 text-sm">{ad.title}</td><td className="px-4 py-3 text-sm">{ad.duration}s</td><td className="px-4 py-3 text-sm font-semibold">₹{ad.reward}</td><td className="px-4 py-3 text-sm">{ad.active ? '✓' : '✗'}</td><td className="px-4 py-3 flex gap-2"><Button size="sm" onClick={() => { setEditAd(ad); setFormData(ad); setShowDialog(true); }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(ad.id)}>Delete</Button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}><DialogContent className="max-w-md" data-testid="ad-dialog"><DialogHeader><DialogTitle>{editAd ? 'Edit Ad' : 'Create Ad'}</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /><Input placeholder="Link URL" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} required /><Input type="number" placeholder="Duration (seconds)" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required /><Input type="number" placeholder="Reward" value={formData.reward} onChange={(e) => setFormData({...formData, reward: e.target.value})} required /><Button type="submit" className="w-full">{editAd ? 'Update' : 'Create'}</Button></form></DialogContent></Dialog>
    </div>
  );
}
