import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Eye } from 'lucide-react';

export default function AdminUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofImage, setProofImage] = useState('');

  useEffect(() => { fetchUploads(); }, []);

  const fetchUploads = async () => {
    try {
      const response = await api.admin.getUploads();
      setUploads(response.data);
    } catch (error) {
      toast.error('Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.admin.approveUpload(id);
      toast.success('Upload approved - ₹1000 credited');
      fetchUploads();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (reason) {
      try {
        await api.admin.rejectUpload(id, reason);
        toast.success('Upload rejected');
        fetchUploads();
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  const handleViewProof = async (id) => {
    try {
      const response = await api.admin.getUploadProof(id);
      setProofImage(response.data.screenshot);
      setShowProofDialog(true);
    } catch (error) {
      toast.error('Failed to load proof');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-uploads">
      <div className="mb-8"><h1 className="text-3xl font-heading font-bold">Uploads Management</h1></div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="space-y-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="bg-secondary/50 p-4 rounded-lg" data-testid={`upload-${upload.id}`}><div className="flex justify-between items-start"><div><p className="font-semibold">{upload.user_name}</p><p className="text-sm text-muted-foreground">{upload.platform}</p><a href={upload.video_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Video</a></div><span className={`px-2 py-1 rounded-full text-xs ${upload.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' : upload.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{upload.status}</span></div>{upload.status === 'Submitted' && (<div className="flex gap-2 mt-3"><Button size="sm" onClick={() => handleViewProof(upload.id)} variant="outline"><Eye className="w-4 h-4 mr-1" />View Proof</Button><Button size="sm" onClick={() => handleApprove(upload.id)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => handleReject(upload.id)}>Reject</Button></div>)}{(upload.status === 'Approved' || upload.status === 'Rejected') && (<div className="mt-3"><Button size="sm" onClick={() => handleViewProof(upload.id)} variant="outline"><Eye className="w-4 h-4 mr-1" />View Proof</Button></div>)}</div>
          ))}
        </div>
      </div>
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-2xl" data-testid="upload-proof-dialog">
          <DialogHeader>
            <DialogTitle>Analytics Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img src={`data:image/png;base64,${proofImage}`} alt="Analytics" className="max-w-full max-h-[600px] rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
