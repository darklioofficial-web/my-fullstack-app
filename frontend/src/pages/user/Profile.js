import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Trash2, FileText, HelpCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: ''
  });
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      
      await api.uploadProfileImage(formData);
      toast.success('Profile image updated successfully!');
      
      // Refresh user data to show new image
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const supportLinks = [
    { icon: FileText, label: 'Terms & Conditions', path: '/cms/terms' },
    { icon: FileText, label: 'Privacy Policy', path: '/cms/privacy' },
    { icon: HelpCircle, label: 'FAQ', path: '/cms/faq' },
    { icon: HelpCircle, label: 'Help & Support', path: '/cms/help' },
    { icon: AlertCircle, label: 'Report a Problem', onClick: () => {
      const email = 'earnkarostudent@gmail.com';
      const subject = 'Problem Report';
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }}
  ];

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-sky-600 to-blue-600 flex items-center justify-center">
              {user?.profile_image ? (
                <img 
                  src={`data:image/png;base64,${user.profile_image}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <label 
              htmlFor="profile-image-upload" 
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
              data-testid="upload-image-button"
            >
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadingImage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </label>
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

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-heading font-bold text-foreground mb-4">Support & Legal</h3>
        <div className="space-y-2">
          {supportLinks.map((link, index) => (
            link.onClick ? (
              <button
                key={index}
                onClick={link.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 rounded-lg transition-colors"
                data-testid={`link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <link.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </button>
            ) : (
              <a
                key={index}
                href={link.path}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 rounded-lg transition-colors"
                data-testid={`link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <link.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </a>
            )
          ))}
        </div>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h3 className="text-lg font-heading font-bold text-red-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-full border-gray-300"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
          
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="w-full rounded-full"
            data-testid="delete-account-button"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent data-testid="delete-account-dialog">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. All your data including earnings, tasks, and submissions will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="flex-1"
              disabled={deleting}
              data-testid="confirm-delete-button"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}