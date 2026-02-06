import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export default function AdminKYC() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchKYC(); }, []);

  const fetchKYC = async () => {
    try {
      const response = await api.admin.getKYC();
      setKycs(response.data);
    } catch (error) {
      toast.error('Failed to load KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.admin.approveKYC(userId);
      toast.success('KYC approved');
      fetchKYC();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (userId) => {
    const reason = window.prompt('Rejection reason:');
    if (reason) {
      try {
        await api.admin.rejectKYC(userId, reason);
        toast.success('KYC rejected');
        fetchKYC();
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-kyc">
      <div className="mb-8"><h1 className="text-3xl font-heading font-bold">KYC Management</h1></div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <table className="w-full">
          <thead className="bg-secondary/50"><tr><th className="px-4 py-3 text-left text-sm">User</th><th className="px-4 py-3 text-left text-sm">Bank</th><th className="px-4 py-3 text-left text-sm">Account</th><th className="px-4 py-3 text-left text-sm">IFSC</th><th className="px-4 py-3 text-left text-sm">Status</th><th className="px-4 py-3 text-left text-sm">Actions</th></tr></thead>
          <tbody>
            {kycs.map((kyc) => (
              <tr key={kyc.id} className="border-t" data-testid={`kyc-${kyc.user_id}`}><td className="px-4 py-3 text-sm">{kyc.user_name}</td><td className="px-4 py-3 text-sm">{kyc.bank_name}</td><td className="px-4 py-3 text-sm">{kyc.account_number}</td><td className="px-4 py-3 text-sm">{kyc.ifsc_code}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${kyc.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' : kyc.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{kyc.status}</span></td><td className="px-4 py-3">{kyc.status === 'Submitted' && (<div className="flex gap-2"><Button size="sm" onClick={() => handleApprove(kyc.user_id)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => handleReject(kyc.user_id)}>Reject</Button></div>)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
