import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users as UsersIcon, Mail, Building2, Plus, MoreVertical, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import InviteUserDialog from '@/components/InviteUserDialog';
import EditUserDialog from '@/components/EditUserDialog';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Company {
  companyID: string;
  companyName: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  // Check if current user can manage users (only IR_ADMIN for edit/delete, all for invite)
  const canManageUsers = profile?.role === 'IR_ADMIN';
  const canInviteUsers = !!profile;

  useEffect(() => {
    fetchUsersAndCompanies();
  }, []);

  const fetchUsersAndCompanies = async () => {
    setLoading(true);
    try {
      const [usersResponse, companiesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_companies')
          .select('companyID, companyName')
          .order('companyName')
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (companiesResponse.error) throw companiesResponse.error;

      setUsers(usersResponse.data || []);
      setCompanies(companiesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load users and companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserInvited = () => {
    fetchUsersAndCompanies(); // Refresh the users list
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditDialogOpen(true);
    }
  };

  const handleUserUpdated = () => {
    fetchUsersAndCompanies(); // Refresh the users list
    setSelectedUser(null);
  };

  const handleDeactivateUser = async (userId: string, userName: string) => {
    if (!canManageUsers) {
      toast({
        title: "Access Denied",
        description: "Only IR Admins can deactivate users",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, you might want to set a status field
      // For now, we'll just show a confirmation message
      toast({
        title: "Feature Coming Soon",
        description: `User deactivation for ${userName} will be implemented soon`,
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'IR_ADMIN':
        return 'bg-error/10 text-error border-error/20';
      case 'ANALYST_MANAGER':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'INVESTMENT_ANALYST':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-text-muted/10 text-text-muted border-text-muted/20';
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No company assigned';
    const company = companies.find(c => c.companyID === companyId);
    return company?.companyName || 'Unknown company';
  };

  if (loading) {
    return (
      <Layout currentPage="users">
        <div className="flex items-center justify-center h-64">
          <div className="text-gold">Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="users">
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gold mb-2">Users</h1>
              <p className="text-text-secondary">Manage team members and user access</p>
            </div>
            <Button 
              onClick={() => setInviteDialogOpen(true)}
              disabled={!canInviteUsers}
              className="bg-gold hover:bg-gold-hover"
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>

          {!canManageUsers && (
            <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-info" />
                <p className="text-info font-medium">User Access</p>
              </div>
              <p className="text-text-secondary text-sm mt-1">
                You can view and invite users. Only IR Admins can edit or manage existing users.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="bg-surface-primary border-border-default hover:border-gold/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 bg-gold/10 border border-gold/20">
                        <AvatarFallback className="text-gold font-semibold">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-text-primary">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'Unknown User'
                          }
                        </CardTitle>
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {formatRole(user.role)}
                        </Badge>
                      </div>
                    </div>
                    
                    {canManageUsers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface-primary border-border-default">
                          <DropdownMenuItem 
                            onClick={() => handleEditUser(user.id)}
                            className="text-text-primary hover:bg-surface-secondary"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeactivateUser(user.id, `${user.first_name || ''} ${user.last_name || ''}`.trim())}
                            className="text-error hover:bg-error/10"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-text-secondary">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">Contact via platform</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="truncate">{getCompanyName(user.company_id)}</span>
                  </div>
                  <div className="text-xs text-text-muted pt-2 border-t border-border-default">
                    <div className="flex justify-between">
                      <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      <span>ID: {user.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">No users found</h3>
              <p className="text-text-muted">
                {canInviteUsers 
                  ? "Invite team members to get started." 
                  : "No users are currently registered on the platform."
                }
              </p>
            </div>
          )}

          {/* User Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-surface-primary border-border-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Total Users</p>
                    <p className="text-2xl font-bold text-text-primary">{users.length}</p>
                  </div>
                  <UsersIcon className="h-8 w-8 text-gold" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-surface-primary border-border-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">IR Admins</p>
                    <p className="text-2xl font-bold text-error">
                      {users.filter(u => u.role === 'IR_ADMIN').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-error" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-surface-primary border-border-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Managers</p>
                    <p className="text-2xl font-bold text-warning">
                      {users.filter(u => u.role === 'ANALYST_MANAGER').length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-surface-primary border-border-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Analysts</p>
                    <p className="text-2xl font-bold text-info">
                      {users.filter(u => u.role === 'INVESTMENT_ANALYST').length}
                    </p>
                  </div>
                  <UsersIcon className="h-8 w-8 text-info" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invite User Dialog */}
      <InviteUserDialog 
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onUserInvited={handleUserInvited}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Layout>
  );
};

export default Users;