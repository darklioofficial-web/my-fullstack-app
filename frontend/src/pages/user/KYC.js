import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ShieldCheck, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function KYC() {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    account_holder: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: ''
  });
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.getKYCStatus();
      setKycStatus(response.data);
    } catch (error) {
      console.error('Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaarFront || !aadhaarBack || !panCard) {
      toast.error('Please upload all required documents');
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(formData));
      formDataObj.append('aadhaar_front', aadhaarFront);
      formDataObj.append('aadhaar_back', aadhaarBack);
      formDataObj.append('pan_card', panCard);
      
      await api.submitKYC(formDataObj);
      toast.success('KYC submitted successfully!');
      fetchKYCStatus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (!kycStatus || kycStatus.status === 'Not Submitted') {
      return {
        icon: ShieldCheck,
        color: 'text-gray-500 bg-gray-100',
        text: 'Not Submitted'
      };
    }
    
    const statusMap = {
      'Submitted': { icon: Clock, color: 'text-yellow-600 bg-yellow-100', text: 'Under Review' },
      'Approved': { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Approved' },
      'Rejected': { icon: XCircle, color: 'text-red-600 bg-red-100', text: 'Rejected' }
    };
    
    return statusMap[kycStatus.status] || statusMap['Submitted'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="kyc-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">KYC Verification</h1>
        <p className="text-muted-foreground">Complete KYC to enable withdrawals</p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${statusDisplay.color}`}>
            <statusDisplay.icon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">KYC Status</p>
            <p className="text-2xl font-heading font-bold text-foreground" data-testid="kyc-status">{statusDisplay.text}</p>
            {kycStatus?.rejection_reason && (
              <p className="text-sm text-red-600 mt-1">Reason: {kycStatus.rejection_reason}</p>
            )}
          </div>
        </div>
      </div>

      {(!kycStatus || kycStatus.status === 'Not Submitted' || kycStatus.status === 'Rejected') && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
          <h3 className="text-xl font-heading font-bold text-foreground mb-6">Submit KYC Documents</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="kyc-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Holder Name</label>
                <Input
                  data-testid="account-holder-input"
                  type="text"
                  value={formData.account_holder}
                  onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
                <Input
                  data-testid="bank-name-input"
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                <Input
                  data-testid="account-number-input"
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">IFSC Code</label>
                <Input
                  data-testid="ifsc-code-input"
                  type="text"
                  value={formData.ifsc_code}
                  onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Branch Name</label>
                <Input
                  data-testid="branch-name-input"
                  type="text"
                  value={formData.branch_name}
                  onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Aadhaar Card (Front)</label>
                <Input
                  data-testid="aadhaar-front-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAadhaarFront(e.target.files[0])}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Aadhaar Card (Back)</label>
                <Input
                  data-testid="aadhaar-back-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAadhaarBack(e.target.files[0])}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PAN Card</label>
                <Input
                  data-testid="pan-card-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPanCard(e.target.files[0])}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 rounded-full h-12 text-base font-semibold"
              data-testid="submit-kyc-button"
            >
              {submitting ? 'Submitting...' : 'Submit KYC'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}