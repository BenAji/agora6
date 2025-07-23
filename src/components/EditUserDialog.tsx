import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, User, Building2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Company {
  companyID: string;
  companyName: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_id: string | null;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onUserUpdated?: () => void;
}

const USER_ROLES = [
  { value: 'IR_ADMIN', label: 'IR Admin', description: 'Full administrative access' },
  { value: 'ANALYST_MANAGER', label: 'Analyst Manager', description: 'Manage analyst teams and RSVPs' },
  { value: 'INVESTMENT_ANALYST', label: 'Investment Analyst', description: 'View events and manage RSVPs' },
];

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onUserUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    companyId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if current user can edit users (only IR_ADMIN)
  const canEditUsers = profile?.role === 'IR_ADMIN';

  useEffect(() => {
    if (open && user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role,
        companyId: user.company_id || 'none',
      });
      fetchCompanies();
    }
  }, [open, user]);

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select('companyID, companyName')
        .order('companyName');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setCompaniesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateUser = async () => {
    if (!validateForm() || !user) return;
    if (!canEditUsers) {
      toast({
        title: "Access Denied",
        description: "Only IR Admins can edit users",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
                  role: formData.role as 'IR_ADMIN' | 'ANALYST_MANAGER' | 'INVESTMENT_ANALYST',
        company_id: formData.companyId === 'none' ? null : formData.companyId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "User Updated Successfully",
        description: `${formData.firstName} ${formData.lastName}'s profile has been updated`,
      });

      onOpenChange(false);
      if (onUserUpdated) onUserUpdated();

    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!canEditUsers) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-primary border-border-default max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gold flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Access Restricted
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-text-secondary">
              Only IR Admins can edit user profiles.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-primary border-border-default max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gold flex items-center">
            <Edit className="mr-2 h-5 w-5" />
            Edit User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info Header */}
          <div className="bg-surface-secondary border border-border-default rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gold mb-2">Editing User</h3>
            <p className="text-text-secondary text-sm">
              User ID: <span className="font-mono">{user.id}</span>
            </p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary border-b border-border-default pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className={errors.firstName ? 'border-error' : ''}
                />
                {errors.firstName && <p className="text-sm text-error">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-error' : ''}
                />
                {errors.lastName && <p className="text-sm text-error">{errors.lastName}</p>}
              </div>
            </div>
          </div>

          {/* Role & Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary border-b border-border-default pb-2">
              Role & Company Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Shield className="mr-1 h-3 w-3" />
                  Role *
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger className={errors.role ? 'border-error' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-text-muted">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-error">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Building2 className="mr-1 h-3 w-3" />
                  Company (Optional)
                </Label>
                <Select 
                  value={formData.companyId} 
                  onValueChange={(value) => handleInputChange('companyId', value)}
                  disabled={companiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={companiesLoading ? "Loading..." : "Select company"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No company assigned</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.companyID} value={company.companyID}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border-default">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={isLoading}
              className="bg-gold hover:bg-gold-hover"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog; 