
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ExternalLink, Bell, BellOff, TrendingUp, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
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
  gicsSector?: string;
  gicsSubCategory?: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<GicsCompany[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, subscriptionsData] = await Promise.all([
          supabase
            .from('gics_companies')
            .select('*')
            .neq('companyName', '') // Filter out empty companies
            .neq('gicsSector', '') // Filter out empty sectors
            .order('companyName'),
          user ? supabase
            .from('subscriptions')
            .select('subID, userID, status, gicsSector, gicsSubCategory')
            .eq('userID', user.id)
            .eq('status', 'ACTIVE') : { data: [], error: null }
        ]);

        if (companiesData.error) throw companiesData.error;
        if (subscriptionsData.error) throw subscriptionsData.error;

        // Filter out companies with empty names or sectors
        const validCompanies = (companiesData.data || []).filter(
          company => company.companyName && company.gicsSector
        );

        setCompanies(validCompanies);
        setSubscriptions(subscriptionsData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isSubscribedToCompany = (company: GicsCompany) => {
    return subscriptions.some(sub => 
      sub.userID === user?.id && 
      sub.status === 'ACTIVE' &&
      sub.gicsSector === company.gicsSector
    );
  };

  const isSubscribedToSector = (sector: string) => {
    return subscriptions.some(sub => 
      sub.userID === user?.id && 
      sub.status === 'ACTIVE' &&
      sub.gicsSector === sector
    );
  };

  const handleSubscribe = async (gicsSector: string, gicsSubCategory: string) => {
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
        status: 'ACTIVE',
        gicsSector: gicsSector,
        gicsSubCategory: gicsSubCategory
      };
      setSubscriptions(prev => [...prev, newSubscription]);

      toast.success(`Subscribed to ${gicsSector} sector`);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    }
  };

  // Get unique sectors from companies (filter out empty sectors)
  const uniqueSectors = Array.from(
    new Set(
      companies
        .map(company => company.gicsSector)
        .filter(sector => sector && sector.trim() !== '')
    )
  ).sort();

  const handleSectorToggle = (sector: string) => {
    if (!sector || sector.trim() === '') return; // Ignore empty sectors
    
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleBulkSubscribe = async () => {
    if (!user || selectedSectors.length === 0) {
      toast.error('Please select sectors to subscribe to');
      return;
    }

    setIsSubscribing(true);
    try {
      console.log('Starting bulk subscription for sectors:', selectedSectors);
      console.log('User ID:', user.id);
      
      // Get all companies in the selected sectors
      const companiesToSubscribe = companies.filter(company => 
        selectedSectors.includes(company.gicsSector)
      );

      console.log('Companies to subscribe to:', companiesToSubscribe.map(c => `${c.companyName} (${c.tickerSymbol})`));

      // Create sector-level subscriptions for selected sectors
      const subscriptionPromises = selectedSectors.map(async (sector) => {
        console.log('Creating subscription for sector:', sector);
        return await supabase
          .from('subscriptions')
          .insert({
            userID: user.id,
            status: 'ACTIVE',
            subStart: new Date().toISOString(),
            gicsSector: sector
          });
      });

      const results = await Promise.all(subscriptionPromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Subscription errors:', errors);
        errors.forEach(error => {
          console.error('Individual error:', error.error);
        });
        throw new Error(`Failed to subscribe to ${errors.length} companies: ${errors[0].error?.message || 'Unknown error'}`);
      }

      console.log('All subscriptions created successfully');

      // Refresh subscriptions data
      const { data: updatedSubscriptions, error: fetchError } = await supabase
        .from('subscriptions')
        .select('subID, userID, status, gicsSector, gicsSubCategory')
        .eq('userID', user.id)
        .eq('status', 'ACTIVE');

      if (fetchError) {
        console.error('Error fetching updated subscriptions:', fetchError);
      } else {
        setSubscriptions(updatedSubscriptions || []);
      }

      toast.success(`Successfully subscribed to ${selectedSectors.length} sector(s)`);
      setSelectedSectors([]);
    } catch (error) {
      console.error('Error bulk subscribing:', error);
      toast.error(`Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async (gicsSector: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'INACTIVE' })
        .eq('userID', user.id)
        .eq('gicsSector', gicsSector)
        .eq('status', 'ACTIVE');

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => !(sub.gicsSector === gicsSector && sub.status === 'ACTIVE')));
      toast.success(`Unsubscribed from ${gicsSector} sector`);
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
          </div>

          {/* Sector Subscription Section */}
          {uniqueSectors.length > 0 && (
            <div className="bg-surface-secondary border border-border-default rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Subscribe to Sectors</h2>
              <p className="text-text-secondary mb-4">Select multiple sectors to subscribe to all companies within those sectors</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {uniqueSectors.map((sector) => {
                  const isAlreadySubscribed = isSubscribedToSector(sector);
                  return (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox 
                        id={sector}
                        checked={selectedSectors.includes(sector) || isAlreadySubscribed}
                        disabled={isAlreadySubscribed}
                        onCheckedChange={() => handleSectorToggle(sector)}
                      />
                      <label 
                        htmlFor={sector} 
                        className={`text-sm cursor-pointer transition-colors ${
                          isAlreadySubscribed 
                            ? 'text-success' 
                            : 'text-text-primary hover:text-gold'
                        }`}
                      >
                        {sector} {isAlreadySubscribed && '✓'}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleBulkSubscribe}
                  disabled={selectedSectors.length === 0 || isSubscribing || !user}
                  className="bg-gold hover:bg-gold-hover"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {isSubscribing ? 'Subscribing...' : `Subscribe to ${selectedSectors.length} Sector(s)`}
                </Button>
                {selectedSectors.length > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedSectors([])}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </div>
          )}

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
                      {isSubscribedToCompany(company) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsubscribe(company.gicsSector)}
                          className="flex-1"
                        >
                          <BellOff className="mr-2 h-3 w-3" />
                          Unsubscribe from Sector
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSubscribe(company.gicsSector, company.gicsSubCategory)}
                          className="flex-1"
                        >
                          <Bell className="mr-2 h-3 w-3" />
                          Subscribe to Sector
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
