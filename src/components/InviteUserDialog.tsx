import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, User, Building2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Company {
  companyID: string;
  companyName: string;
}

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserInvited?: () => void;
}

const USER_ROLES = [
  { value: 'IR_ADMIN', label: 'IR Admin', description: 'Full administrative access' },
  { value: 'ANALYST_MANAGER', label: 'Analyst Manager', description: 'Manage analyst teams and RSVPs' },
  { value: 'INVESTMENT_ANALYST', label: 'Investment Analyst', description: 'View events and manage RSVPs' },
];

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onOpenChange,
  onUserInvited
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    companyId: '',
    tempPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // All users can invite other users
  const canInviteUsers = !!profile;

  useEffect(() => {
    if (open) {
      fetchCompanies();
      generateTempPassword();
    }
  }, [open]);

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

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, tempPassword: result }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.tempPassword) {
      newErrors.tempPassword = 'Temporary password is required';
    } else if (formData.tempPassword.length < 8) {
      newErrors.tempPassword = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInviteUser = async () => {
    if (!validateForm()) return;
    if (!canInviteUsers) {
      toast({
        title: "Authentication Required",
        description: "Please log in to invite users",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send invitation email using Supabase's invitation system
      const { data: inviteData, error: inviteError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.tempPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            company_id: formData.companyId === 'none' ? null : formData.companyId,
            invited_by: profile?.id,
            invitation: true,
          }
        }
      });

      if (inviteError) {
        // Handle specific error cases
        if (inviteError.message.includes('already registered')) {
          throw new Error('A user with this email address already exists');
        }
        throw inviteError;
      }

      // Store invitation details in localStorage for follow-up
      if (inviteData.user) {
        const invitationRecord = {
          userId: inviteData.user.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          companyId: formData.companyId === 'none' ? null : formData.companyId,
          tempPassword: formData.tempPassword,
          invitedBy: profile?.id,
          invitedAt: new Date().toISOString(),
          status: 'pending'
        };
        
        // Store for follow-up processing
        const existingInvitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]');
        existingInvitations.push(invitationRecord);
        localStorage.setItem('pending_invitations', JSON.stringify(existingInvitations));
      }

      toast({
        title: "Invitation Sent Successfully",
        description: `${formData.firstName} ${formData.lastName} has been invited. They will receive an email to verify their account.`,
      });

      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        companyId: '',
        tempPassword: '',
      });
      setErrors({});
      
      onOpenChange(false);
      if (onUserInvited) onUserInvited();

    } catch (error: any) {
      console.error('Error inviting user:', error);
      let errorMessage = "Failed to send invitation. Please try again.";
      
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = "A user with this email address already exists.";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Password is too weak. Please generate a stronger password.";
      }
      
      toast({
        title: "Invitation Failed",
        description: errorMessage,
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

  if (!canInviteUsers) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-primary border-border-default max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gold flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Authentication Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-text-secondary">
              Please log in to invite new users to the platform.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-primary border-border-default max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Invite New User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary border-b border-border-default pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="mr-1 h-3 w-3" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="user@company.com"
                  className={errors.email ? 'border-error' : ''}
                />
                {errors.email && <p className="text-sm text-error">{errors.email}</p>}
              </div>

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

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary border-b border-border-default pb-2">
              Security
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tempPassword">Temporary Password *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={generateTempPassword}
                  className="text-gold hover:text-gold-hover"
                >
                  Generate New
                </Button>
              </div>
              <Input
                id="tempPassword"
                type="text"
                value={formData.tempPassword}
                onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                placeholder="Temporary password"
                className={`font-mono ${errors.tempPassword ? 'border-error' : ''}`}
              />
              {errors.tempPassword && <p className="text-sm text-error">{errors.tempPassword}</p>}
              <p className="text-xs text-text-muted">
                User will receive an email invitation and can use this password to sign in
              </p>
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
              onClick={handleInviteUser}
              disabled={isLoading}
              className="bg-gold hover:bg-gold-hover"
            >
              {isLoading ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog; 