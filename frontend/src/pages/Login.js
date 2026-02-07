import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount >= 4) {
      navigate('/admin/login');
    }
    
    // Reset counter after 3 seconds
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [clickCount, navigate]);

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.login(formData);
      login(response.data.token, response.data.is_admin);
      toast.success('Login successful!');
      
      if (response.data.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img 
              src="/logo.png" 
              alt="EarnKaro Student" 
              className="w-20 h-20 mx-auto mb-4 drop-shadow-lg cursor-pointer hover:scale-105 transition-transform" 
              onClick={handleLogoClick}
            />
            {clickCount > 0 && clickCount < 4 && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                {clickCount}/4
              </div>
            )}
          </div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Login to continue earning</p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email or Mobile</label>
              <Input
                data-testid="login-identifier-input"
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="Enter email or mobile"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                data-testid="login-password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>

            <Button
              data-testid="login-submit-button"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              disabled={loading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              New user?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline" data-testid="register-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}