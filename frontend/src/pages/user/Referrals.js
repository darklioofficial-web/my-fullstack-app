import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Users, Gift, Copy, Check } from 'lucide-react';

export default function Referrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await api.getReferrals();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="referrals-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Referrals</h1>
        <p className="text-muted-foreground">Invite friends and earn rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground mb-1" data-testid="total-referrals">{data?.total_referrals || 0}</p>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground mb-1" data-testid="referral-earnings">₹{data?.referral_earnings?.toFixed(2) || 0}</p>
          <p className="text-sm text-muted-foreground">Referral Earnings</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm p-6 text-white">
          <p className="text-lg font-semibold mb-1">Earn Per Referral</p>
          <p className="text-4xl font-heading font-bold">₹20</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <h3 className="text-xl font-heading font-bold text-foreground mb-4">Your Referral Credentials</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Referral Code</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono font-bold text-lg text-primary" data-testid="referral-code">
                {data?.referral_code}
              </div>
              <Button
                onClick={() => copyToClipboard(data?.referral_code)}
                variant="outline"
                className="px-6"
                data-testid="copy-code-button"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Referral Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 text-sm text-foreground overflow-x-auto" data-testid="referral-link">
                {data?.referral_link}
              </div>
              <Button
                onClick={() => copyToClipboard(data?.referral_link)}
                variant="outline"
                className="px-6"
                data-testid="copy-link-button"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 mb-8 border border-sky-200">
        <h3 className="text-lg font-heading font-bold text-foreground mb-3">How It Works</h3>
        <ol className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Share your referral link or code with friends</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>When they sign up using your link, they become your referral</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>You earn ₹20 for each successful signup!</span>
          </li>
        </ol>
      </div>

      {data?.referrals?.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
          <h3 className="text-xl font-heading font-bold text-foreground mb-6">Your Referrals</h3>
          <div className="space-y-3">
            {data.referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg" data-testid={`referral-${referral.id}`}>
                <div>
                  <p className="font-semibold text-foreground">{referral.full_name}</p>
                  <p className="text-sm text-muted-foreground">{referral.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">₹20</p>
                  <p className="text-xs text-muted-foreground">{new Date(referral.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}