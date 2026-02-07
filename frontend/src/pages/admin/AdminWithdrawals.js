import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Eye } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

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

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsDialog(true);
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
          <thead className="bg-secondary/50"><tr><th className="px-4 py-3 text-left text-sm">User</th><th className="px-4 py-3 text-left text-sm">Amount</th><th className="px-4 py-3 text-left text-sm">Method</th><th className="px-4 py-3 text-left text-sm">KYC</th><th className="px-4 py-3 text-left text-sm">Status</th><th className="px-4 py-3 text-left text-sm">Actions</th></tr></thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-t" data-testid={`withdrawal-${w.id}`}><td className="px-4 py-3 text-sm">{w.user_name}</td><td className="px-4 py-3 text-sm font-semibold">₹{w.amount}</td><td className="px-4 py-3 text-sm">{w.method}</td><td className="px-4 py-3 text-sm">{w.kyc_status}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${w.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : w.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{w.status}</span></td><td className="px-4 py-3"><div className="flex gap-2">{w.status === 'Pending' && (<><Button size="sm" onClick={() => handleViewDetails(w)} variant="outline"><Eye className="w-4 h-4 mr-1" />View</Button><Button size="sm" onClick={() => handleApprove(w.id)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => handleReject(w.id)}>Reject</Button></>)}{w.status !== 'Pending' && (<Button size="sm" onClick={() => handleViewDetails(w)} variant="outline"><Eye className="w-4 h-4 mr-1" />View</Button>)}</div></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl" data-testid="withdrawal-details-dialog">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-secondary/30 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{selectedWithdrawal.user_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{selectedWithdrawal.user_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">KYC Status</p>
                      <p className="font-semibold">{selectedWithdrawal.kyc_status}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-secondary/30 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Withdrawal Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-heading font-bold text-green-600">₹{selectedWithdrawal.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-semibold">{selectedWithdrawal.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedWithdrawal.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        selectedWithdrawal.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedWithdrawal.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Request Date</p>
                      <p className="font-semibold">{new Date(selectedWithdrawal.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-secondary/30 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
                  {selectedWithdrawal.method === 'UPI' ? (
                    <div>
                      <p className="text-sm text-muted-foreground">UPI ID</p>
                      <p className="font-semibold text-lg">{selectedWithdrawal.upi_id}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Holder</p>
                        <p className="font-semibold">{selectedWithdrawal.account_holder}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-semibold">{selectedWithdrawal.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-semibold font-mono">{selectedWithdrawal.account_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">IFSC Code</p>
                        <p className="font-semibold font-mono">{selectedWithdrawal.ifsc_code}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.rejection_reason && (
                  <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-1">Rejection Reason</h3>
                    <p className="text-sm text-red-700">{selectedWithdrawal.rejection_reason}</p>
                  </div>
                )}
              </div>

              {selectedWithdrawal.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleApprove(selectedWithdrawal.id);
                    }} 
                    className="flex-1"
                  >
                    Approve Withdrawal
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleReject(selectedWithdrawal.id);
                    }} 
                    variant="destructive"
                    className="flex-1"
                  >
                    Reject Withdrawal
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
