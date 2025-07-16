import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Building2, Users, BarChart3 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

const AuthForm = ({ mode, onModeChange }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    company: '',
  });

  const roles = [
    { id: 'ir_admin', label: 'IR Admin', icon: BarChart3, description: 'Manage events and analytics' },
    { id: 'analyst_manager', label: 'Analyst Manager', icon: Users, description: 'Oversee team RSVPs' },
    { id: 'investment_analyst', label: 'Investment Analyst', icon: Building2, description: 'Track company events' },
  ];

  const companies = [
    'Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'Bank of America',
    'Citigroup', 'Wells Fargo', 'Blackstone', 'Blackrock', 'Vanguard',
    'Fidelity Investments', 'Charles Schwab', 'Deutsche Bank'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Card variant="terminal" className="w-full max-w-md mx-auto shadow-terminal">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-gold rounded-sm flex items-center justify-center mb-4">
          <span className="text-black font-bold text-xl">A</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gold">
          {mode === 'login' ? 'Welcome Back' : 'Join Agora'}
        </CardTitle>
        <p className="text-text-secondary text-sm">
          {mode === 'login' 
            ? 'Access your Bloomberg-style IR dashboard' 
            : 'Create your professional IR account'
          }
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="font-mono"
            />
          </div>
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-gold"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Select Role</label>
                <div className="grid gap-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.id })}
                        className={`p-3 rounded-sm border text-left transition-all duration-200 ${
                          formData.role === role.id
                            ? 'border-gold bg-surface-secondary'
                            : 'border-border-default hover:border-gold-muted'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-gold" />
                          <div>
                            <div className="font-medium text-text-primary">{role.label}</div>
                            <div className="text-xs text-text-secondary">{role.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Company</label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full h-10 px-3 py-2 bg-surface-secondary border border-border-default rounded-sm text-text-primary focus:border-gold focus:ring-2 focus:ring-gold transition-colors duration-200"
                >
                  <option value="">Select your company</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <Button type="submit" className="w-full" size="lg">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-gold hover:text-gold-hover underline"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;