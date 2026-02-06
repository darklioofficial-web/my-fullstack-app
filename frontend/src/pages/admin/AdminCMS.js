import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export default function AdminCMS() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPage, setEditPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      const response = await api.admin.getCMSPages();
      setPages(response.data);
    } catch (error) {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setEditPage(page);
    setFormData({ title: page.title, content: page.content });
  };

  const handleUpdate = async () => {
    try {
      await api.admin.updateCMSPage(editPage.page_id, formData);
      toast.success('Page updated');
      setEditPage(null);
      fetchPages();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-cms">
      <div className="mb-8"><h1 className="text-3xl font-heading font-bold">CMS Pages</h1></div>
      <div className="bg-card rounded-xl border shadow-sm p-6"><table className="w-full"><thead className="bg-secondary/50"><tr><th className="px-4 py-3 text-left text-sm">Page ID</th><th className="px-4 py-3 text-left text-sm">Title</th><th className="px-4 py-3 text-left text-sm">Actions</th></tr></thead><tbody>{pages.map((page) => (<tr key={page.page_id} className="border-t" data-testid={`cms-${page.page_id}`}><td className="px-4 py-3 text-sm">{page.page_id}</td><td className="px-4 py-3 text-sm">{page.title}</td><td className="px-4 py-3"><Button size="sm" onClick={() => handleEdit(page)}>Edit</Button></td></tr>))}</tbody></table></div>
      <Dialog open={!!editPage} onOpenChange={() => setEditPage(null)}><DialogContent className="max-w-2xl" data-testid="cms-dialog"><DialogHeader><DialogTitle>Edit Page</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /><textarea className="w-full min-h-[200px] p-3 border rounded-lg" placeholder="Content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} /><Button onClick={handleUpdate} className="w-full">Update Page</Button></div></DialogContent></Dialog>
    </div>
  );
}
