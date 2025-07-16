import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ExternalLink, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Company {
  companyID: string;
  companyName: string;
  location: string | null;
  createdAt: string | null;
}

interface Subscription {
  subID: string;
  userID: string;
  status: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, subscriptionsData] = await Promise.all([
          supabase
            .from('user_companies')
            .select('*')
            .order('companyName'),
          user ? supabase
            .from('subscriptions')
            .select('*')
            .eq('userID', user.id)
            .eq('status', 'ACTIVE') : { data: [], error: null }
        ]);

        if (companiesData.error) throw companiesData.error;
        if (subscriptionsData.error) throw subscriptionsData.error;

        setCompanies(companiesData.data || []);
        setSubscriptions(subscriptionsData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isSubscribed = (companyID: string) => {
    return subscriptions.some(sub => sub.userID === user?.id);
  };

  const handleSubscribe = async (companyID: string, companyName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          userID: user.id,
          status: 'ACTIVE',
          subStart: new Date().toISOString(),
          gicsSector: null,
          gicsSubCategory: null
        });

      if (error) throw error;

      setSubscriptions(prev => [...prev, {
        subID: crypto.randomUUID(),
        userID: user.id,
        status: 'ACTIVE'
      }]);

      toast.success(`Subscribed to ${companyName}`);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    }
  };

  const handleUnsubscribe = async (companyID: string, companyName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'INACTIVE' })
        .eq('userID', user.id)
        .eq('status', 'ACTIVE');

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.userID !== user.id));
      toast.success(`Unsubscribed from ${companyName}`);
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe');
    }
  };

  if (loading) {
    return (
      <Layout currentPage="companies">
        <div className="flex items-center justify-center h-64">
          <div className="text-gold">Loading companies...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="companies">
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gold mb-2">Companies</h1>
              <p className="text-text-secondary">Manage and view company information</p>
            </div>
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.companyID} className="bg-surface-primary border-border-default hover:border-gold/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gold/10 rounded-sm flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-text-primary">{company.companyName}</CardTitle>
                        {company.location && (
                          <div className="flex items-center text-sm text-text-secondary mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {company.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
                    <div className="text-xs text-text-muted">
                      {company.createdAt && new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isSubscribed(company.companyID) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsubscribe(company.companyID, company.companyName)}
                        className="flex-1"
                      >
                        <BellOff className="mr-2 h-3 w-3" />
                        Unsubscribe
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSubscribe(company.companyID, company.companyName)}
                        className="flex-1"
                      >
                        <Bell className="mr-2 h-3 w-3" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">No companies found</h3>
              <p className="text-text-muted">Add your first company to get started.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Companies;