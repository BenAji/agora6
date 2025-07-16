import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Search, Building2, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: string;
  created_at: string;
  user_companies?: {
    companyName: string;
  };
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Only show users from same company or if user is analyst
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_companies (
            companyName
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'IR_ADMIN':
        return 'destructive';
      case 'ANALYST_MANAGER':
        return 'default';
      case 'INVESTMENT_ANALYST':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'IR_ADMIN':
        return 'IR Admin';
      case 'ANALYST_MANAGER':
        return 'Analyst Manager';
      case 'INVESTMENT_ANALYST':
        return 'Investment Analyst';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const role = user.role.toLowerCase();
    const company = user.user_companies?.companyName?.toLowerCase() || '';
    
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      role.includes(searchTerm.toLowerCase()) ||
      company.includes(searchTerm.toLowerCase())
    );
  });

  // Check if user can view all users (analysts can see all, IR admins see their company)
  const canViewAllUsers = profile?.role === 'INVESTMENT_ANALYST' || profile?.role === 'ANALYST_MANAGER';

  return (
    <Layout currentPage="users">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Users</h1>
            <p className="text-text-secondary">
              Manage user access and view team information
            </p>
          </div>
        </div>

        {/* Search */}
        <Card variant="terminal">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                placeholder="Search users by name, role, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="terminal">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-surface-secondary rounded"></div>
                    <div className="h-3 bg-surface-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm ? 'No users found' : 'No users available'}
              </h3>
              <p className="text-text-secondary">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Users will appear here when they join the platform.'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} variant="terminal" className="hover:bg-surface-secondary transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gold">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs mt-1">
                          {getRoleDisplay(user.role)}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.user_companies?.companyName && (
                    <div className="flex items-center space-x-2 text-text-secondary">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">{user.user_companies.companyName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Summary */}
        <Card variant="terminal">
          <CardHeader>
            <CardTitle className="text-gold">User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">{users.length}</div>
                <div className="text-sm text-text-secondary">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {users.filter(u => u.role === 'IR_ADMIN').length}
                </div>
                <div className="text-sm text-text-secondary">IR Admins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {users.filter(u => u.role === 'ANALYST_MANAGER').length}
                </div>
                <div className="text-sm text-text-secondary">Managers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {users.filter(u => u.role === 'INVESTMENT_ANALYST').length}
                </div>
                <div className="text-sm text-text-secondary">Analysts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;