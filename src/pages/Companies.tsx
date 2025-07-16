import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ExternalLink, Bell, BellOff, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GicsCompany {
  companyID: string;
  companyName: string;
  tickerSymbol: string;
  gicsSector: string;
  gicsSubCategory: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Subscription {
  subID: string;
  userID: string;
  status: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<GicsCompany[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, subscriptionsData] = await Promise.all([
          supabase
            .from('gics_companies')
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

  const isSubscribed = (tickerSymbol: string) => {
    return subscriptions.some(sub => 
      sub.userID === user?.id && 
      sub.status === 'ACTIVE'
    );
  };

  const handleSubscribe = async (tickerSymbol: string, companyName: string, gicsSector: string, gicsSubCategory: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          userID: user.id,
          status: 'ACTIVE',
          subStart: new Date().toISOString(),
          gicsSector: gicsSector,
          gicsSubCategory: gicsSubCategory
        });

      if (error) throw error;

      // Add to local state
      const newSubscription = {
        subID: crypto.randomUUID(),
        userID: user.id,
        status: 'ACTIVE'
      };
      setSubscriptions(prev => [...prev, newSubscription]);

      toast.success(`Subscribed to ${companyName} (${tickerSymbol})`);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    }
  };

  const handleUnsubscribe = async (tickerSymbol: string, companyName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'INACTIVE' })
        .eq('userID', user.id)
        .eq('status', 'ACTIVE');

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.status !== 'ACTIVE'));
      toast.success(`Unsubscribed from ${companyName} (${tickerSymbol})`);
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
              <h1 className="text-3xl font-bold text-gold mb-2">GICS Companies</h1>
              <p className="text-text-secondary">Browse and subscribe to companies by sector and ticker symbol</p>
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
                        <TrendingUp className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                          {company.companyName}
                          <Badge variant="outline" className="text-xs font-mono">
                            {company.tickerSymbol}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center text-sm text-text-secondary mt-1">
                          <Building2 className="h-3 w-3 mr-1" />
                          {company.gicsSector}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {company.gicsSubCategory}
                      </Badge>
                      <div className="text-xs text-text-muted">
                        {company.updatedAt && new Date(company.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {isSubscribed(company.tickerSymbol) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsubscribe(company.tickerSymbol, company.companyName)}
                          className="flex-1"
                        >
                          <BellOff className="mr-2 h-3 w-3" />
                          Unsubscribe
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSubscribe(company.tickerSymbol, company.companyName, company.gicsSector, company.gicsSubCategory)}
                          className="flex-1"
                        >
                          <Bell className="mr-2 h-3 w-3" />
                          Subscribe
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">No GICS companies found</h3>
              <p className="text-text-muted">GICS company data will appear here once available.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Companies;