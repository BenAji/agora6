import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users as UsersIcon, Mail, Building2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_id: string | null;
  created_at: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="bg-surface-primary border-border-default hover:border-gold/30 transition-colors">
                <CardHeader className="pb-3">
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
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-text-secondary">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">Contact via platform</span>
                  </div>
                  {user.company_id && (
                    <div className="flex items-center text-sm text-text-secondary">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">Company Member</span>
                    </div>
                  )}
                  <div className="text-xs text-text-muted pt-2 border-t border-border-default">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">No users found</h3>
              <p className="text-text-muted">Invite team members to get started.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Users;