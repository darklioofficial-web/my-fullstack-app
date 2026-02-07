import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
    referral_code: ''
  });
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

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirm_password, ...registerData } = formData;
      const response = await api.register(registerData);
      login(response.data.token);
      toast.success('Registration successful! Welcome bonus added!');
      navigate('/user/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
            Create Account
          </h1>
          <p className="text-muted-foreground">Start earning today!</p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input
                data-testid="register-name-input"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                data-testid="register-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
              <Input
                data-testid="register-mobile-input"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                data-testid="register-password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <Input
                data-testid="register-confirm-password-input"
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Confirm password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referral Code (Optional)</label>
              <Input
                data-testid="register-referral-code-input"
                type="text"
                value={formData.referral_code}
                onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                placeholder="Enter referral code if you have one"
              />
              <p className="text-xs text-muted-foreground mt-1">Get ₹10 welcome bonus + referrer gets ₹20</p>
            </div>

            <Button
              data-testid="register-submit-button"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              disabled={loading}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline" data-testid="login-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}