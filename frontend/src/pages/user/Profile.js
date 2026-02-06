import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-sky-600 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground" data-testid="user-name">{user?.full_name}</h2>
            <p className="text-muted-foreground" data-testid="user-email">{user?.email}</p>
            <p className="text-sm text-muted-foreground" data-testid="user-mobile">{user?.mobile}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6" data-testid="profile-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input
                data-testid="full-name-input"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
              <Input
                data-testid="dob-input"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                data-testid="gender-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updating}
            className="w-full bg-primary hover:bg-primary/90 rounded-full"
            data-testid="update-profile-button"
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground mb-1">KYC Status</h3>
            <p className="text-sm text-muted-foreground" data-testid="kyc-status-badge">{user?.kyc_status || 'Not Submitted'}</p>
          </div>
          <Button onClick={() => navigate('/user/kyc')} variant="outline" data-testid="goto-kyc-button">
            Manage KYC
          </Button>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h3 className="text-lg font-heading font-bold text-red-900 mb-4">Danger Zone</h3>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full rounded-full"
          data-testid="logout-button"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}