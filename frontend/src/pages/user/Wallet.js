import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Wallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    method: 'UPI',
    upi_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await api.getWallet();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createWithdrawal(withdrawData);
      toast.success('Withdrawal request submitted!');
      setShowWithdraw(false);
      setWithdrawData({
        amount: '',
        method: 'UPI',
        upi_id: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder: ''
      });
      fetchWallet();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="wallet-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-lg shadow-sky-600/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-100 text-sm font-medium mb-2">Available Balance</p>
            <p className="text-5xl font-heading font-bold text-white mb-4" data-testid="balance-amount">
              ₹{data?.balance?.toFixed(2) || 0}
            </p>
            <Button
              onClick={() => setShowWithdraw(true)}
              className="bg-white text-primary hover:bg-white/90 rounded-full font-semibold"
              data-testid="withdraw-button"
            >
              Withdraw Funds
            </Button>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <WalletIcon className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <h3 className="text-xl font-heading font-bold text-foreground mb-6">Transaction History</h3>
        
        {data?.transactions?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {data?.transactions?.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg" data-testid={`transaction-${tx.id}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'Credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'Credit' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-heading font-bold ${
                    tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="max-w-md" data-testid="withdraw-dialog">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
              <Input
                data-testid="withdraw-amount-input"
                type="number"
                value={withdrawData.amount}
                onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                placeholder="Enter amount"
                min="500"
                max="5000"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Min: ₹500, Max: ₹5000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
              <Select
                value={withdrawData.method}
                onValueChange={(value) => setWithdrawData({ ...withdrawData, method: value })}
                data-testid="payment-method-select"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {withdrawData.method === 'UPI' ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">UPI ID</label>
                <Input
                  data-testid="upi-id-input"
                  type="text"
                  value={withdrawData.upi_id}
                  onChange={(e) => setWithdrawData({ ...withdrawData, upi_id: e.target.value })}
                  placeholder="yourname@upi"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Account Holder Name</label>
                  <Input
                    data-testid="account-holder-input"
                    type="text"
                    value={withdrawData.account_holder}
                    onChange={(e) => setWithdrawData({ ...withdrawData, account_holder: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
                  <Input
                    data-testid="bank-name-input"
                    type="text"
                    value={withdrawData.bank_name}
                    onChange={(e) => setWithdrawData({ ...withdrawData, bank_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                  <Input
                    data-testid="account-number-input"
                    type="text"
                    value={withdrawData.account_number}
                    onChange={(e) => setWithdrawData({ ...withdrawData, account_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">IFSC Code</label>
                  <Input
                    data-testid="ifsc-code-input"
                    type="text"
                    value={withdrawData.ifsc_code}
                    onChange={(e) => setWithdrawData({ ...withdrawData, ifsc_code: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 rounded-full"
              data-testid="submit-withdraw-button"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}