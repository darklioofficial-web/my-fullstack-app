import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.adminLogin(formData);
      login(response.data.token, true);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/30 mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Login to access admin dashboard</p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="admin-login-form">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <Input
                data-testid="admin-username-input"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                data-testid="admin-password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter admin password"
                required
              />
            </div>

            <Button
              data-testid="admin-login-submit"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 font-semibold"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}