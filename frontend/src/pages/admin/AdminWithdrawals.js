import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWithdrawals(); }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.admin.getWithdrawals();
      setWithdrawals(response.data);
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.admin.approveWithdrawal(id);
      toast.success('Withdrawal approved');
      fetchWithdrawals();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (reason) {
      try {
        await api.admin.rejectWithdrawal(id, reason);
        toast.success('Withdrawal rejected');
        fetchWithdrawals();
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-withdrawals">
      <div className="mb-8"><h1 className="text-3xl font-heading font-bold">Withdrawals Management</h1></div>
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <table className="w-full">
          <thead className="bg-secondary/50"><tr><th className="px-4 py-3 text-left text-sm">User</th><th className="px-4 py-3 text-left text-sm">Amount</th><th className="px-4 py-3 text-left text-sm">Method</th><th className="px-4 py-3 text-left text-sm">Details</th><th className="px-4 py-3 text-left text-sm">KYC</th><th className="px-4 py-3 text-left text-sm">Status</th><th className="px-4 py-3 text-left text-sm">Actions</th></tr></thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-t" data-testid={`withdrawal-${w.id}`}><td className="px-4 py-3 text-sm">{w.user_name}</td><td className="px-4 py-3 text-sm font-semibold">₹{w.amount}</td><td className="px-4 py-3 text-sm">{w.method}</td><td className="px-4 py-3 text-sm">{w.method === 'UPI' ? w.upi_id : `${w.account_number} - ${w.ifsc_code}`}</td><td className="px-4 py-3 text-sm">{w.kyc_status}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${w.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : w.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{w.status}</span></td><td className="px-4 py-3">{w.status === 'Pending' && (<div className="flex gap-2"><Button size="sm" onClick={() => handleApprove(w.id)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => handleReject(w.id)}>Reject</Button></div>)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
