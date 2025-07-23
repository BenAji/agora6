
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ExternalLink, Bell, BellOff, TrendingUp, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [selectedSubSectors, setSelectedSubSectors] = useState<string[]>([]);
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user, profile } = useAuth();

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

          profile ? supabase
            .from('subscriptions')
            .select('subID, userID, status, gicsSector, gicsSubCategory')
            .eq('userID', profile.user_id)
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
      sub.userID === profile?.id && 
      sub.status === 'ACTIVE' &&
      sub.gicsSector === company.gicsSector &&
      (
        // Either subscribed to the entire sector (no gicsSubCategory)
        !sub.gicsSubCategory ||
        // Or subscribed to the specific subsector that matches the company
        sub.gicsSubCategory === company.gicsSubCategory
      )
    );
  };

  const isSubscribedToSector = (sector: string) => {
    return subscriptions.some(sub => 
      sub.userID === profile?.id && 
      sub.status === 'ACTIVE' &&
      sub.gicsSector === sector &&
      !sub.gicsSubCategory // Sector-level subscription only
    );
  };

  const isSubscribedToSubSector = (sector: string, subSector: string) => {
    return subscriptions.some(sub => 
      sub.userID === profile?.id && 
      sub.status === 'ACTIVE' &&
      sub.gicsSector === sector &&
      sub.gicsSubCategory === subSector
    );
  };

  const handleSubscribe = async (gicsSector: string, gicsSubCategory: string) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          userID: profile.user_id,
          status: 'ACTIVE',
          subStart: new Date().toISOString(),
          gicsSector: gicsSector,
          gicsSubCategory: gicsSubCategory
        });

      if (error) throw error;

      // Add to local state
      const newSubscription = {
        subID: crypto.randomUUID(),
        userID: profile.user_id,
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
    if (isSubscribedToSector(sector)) return; // Can't unselect already subscribed sectors
    
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSubSectorToggle = (sector: string, subSector: string) => {
    if (isSubscribedToSubSector(sector, subSector)) return; // Can't unselect already subscribed subsectors
    
    const key = `${sector}:${subSector}`;
    setSelectedSubSectors(prev => 
      prev.includes(key) 
        ? prev.filter(s => s !== key)
        : [...prev, key]
    );
  };

  const toggleSectorExpansion = (sector: string) => {
    setExpandedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  // Get unique subsectors for a given sector
  const getSectorSubSectors = (sector: string) => {
    return [...new Set(companies
      .filter(company => company.gicsSector === sector)
      .map(company => company.gicsSubCategory)
      .filter(Boolean)
    )].sort();
  };

  const handleBulkSubscribe = async () => {
    if (!profile || (selectedSectors.length === 0 && selectedSubSectors.length === 0)) return;

    try {
      setIsSubscribing(true);
      console.log('Bulk subscribing to sectors:', selectedSectors, 'and subsectors:', selectedSubSectors);

      // First, check for existing subscriptions to avoid duplicates
      const { data: existingSubscriptions, error: existingError } = await supabase
        .from('subscriptions')
        .select('gicsSector, gicsSubCategory')
        .eq('userID', profile.user_id)
        .eq('status', 'ACTIVE');

      if (existingError) {
        console.error('Error fetching existing subscriptions:', existingError);
        throw new Error('Failed to check existing subscriptions');
      }

      const existingKeys = new Set();
      existingSubscriptions?.forEach(sub => {
        if (sub.gicsSector && !sub.gicsSubCategory) {
          existingKeys.add(sub.gicsSector);
        } else if (sub.gicsSector && sub.gicsSubCategory) {
          existingKeys.add(`${sub.gicsSector}:${sub.gicsSubCategory}`);
        }
      });

      // Filter out already existing subscriptions
      const newSectors = selectedSectors.filter(sector => !existingKeys.has(sector));
      const newSubSectors = selectedSubSectors.filter(key => !existingKeys.has(key));

      console.log('New sectors to subscribe:', newSectors);
      console.log('New subsectors to subscribe:', newSubSectors);

      const subscriptionsToCreate = [];

      // Prepare sector-level subscriptions
      newSectors.forEach(sector => {
        subscriptionsToCreate.push({
          userID: profile.user_id,
          status: 'ACTIVE' as const,
          subStart: new Date().toISOString(),
          gicsSector: sector,
          gicsSubCategory: null
        });
      });

      // Prepare subsector-level subscriptions
      newSubSectors.forEach(key => {
        const [sector, subSector] = key.split(':');
        subscriptionsToCreate.push({
          userID: profile.user_id,
          status: 'ACTIVE' as const,
          subStart: new Date().toISOString(),
          gicsSector: sector,
          gicsSubCategory: subSector
        });
      });

      if (subscriptionsToCreate.length === 0) {
        toast.error('All selected items are already subscribed');
        setSelectedSectors([]);
        setSelectedSubSectors([]);
        return;
      }

      console.log('Creating subscriptions:', subscriptionsToCreate);

      // Create all subscriptions in a single batch
      const { data: results, error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionsToCreate)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log('Subscriptions created successfully:', results);

      console.log('All subscriptions created successfully');

      // Refresh subscriptions data
      const { data: updatedSubscriptions, error: refreshError } = await supabase
        .from('subscriptions')
        .select('subID, userID, status, gicsSector, gicsSubCategory')
        .eq('userID', profile.user_id)
        .eq('status', 'ACTIVE');

      if (refreshError) {
        console.error('Error fetching updated subscriptions:', refreshError);
      } else {
        setSubscriptions(updatedSubscriptions || []);
      }

      const totalSubscriptions = selectedSectors.length + selectedSubSectors.length;
      toast.success(`Successfully subscribed to ${totalSubscriptions} item(s)`);
      setSelectedSectors([]);
      setSelectedSubSectors([]);
    } catch (error) {
      console.error('Error bulk subscribing:', error);
      toast.error(`Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async (gicsSector: string, gicsSubCategory?: string) => {
    if (!user || !profile) return;

    try {
      let query = supabase
        .from('subscriptions')
        .update({ status: 'INACTIVE' })
        .eq('userID', profile.user_id)
        .eq('gicsSector', gicsSector)
        .eq('status', 'ACTIVE');

      if (gicsSubCategory) {
        query = query.eq('gicsSubCategory', gicsSubCategory);
      } else {
        query = query.is('gicsSubCategory', null);
      }

      const { error } = await query;

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => 
        !(sub.gicsSector === gicsSector && 
          sub.status === 'ACTIVE' && 
          (gicsSubCategory ? sub.gicsSubCategory === gicsSubCategory : !sub.gicsSubCategory))
      ));
      const itemType = gicsSubCategory ? `${gicsSector} - ${gicsSubCategory}` : gicsSector;
      toast.success(`Unsubscribed from ${itemType}`);
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
               <p className="text-text-secondary mb-4">Select sectors for broad coverage, or expand them to choose specific subsectors for more granular subscriptions</p>
              
              <div className="space-y-4 mb-6">
                {uniqueSectors.map((sector) => {
                  const isAlreadySubscribed = isSubscribedToSector(sector);
                  const subSectors = getSectorSubSectors(sector);
                  const isExpanded = expandedSectors.includes(sector);
                  
                  return (
                    <div key={sector} className="border border-border-default rounded-lg">
                      {/* Sector Header */}
                      <div className="flex items-center justify-between p-4 bg-surface-primary">
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox 
                            id={sector}
                            checked={selectedSectors.includes(sector) || isAlreadySubscribed}
                            disabled={isAlreadySubscribed}
                            onCheckedChange={() => handleSectorToggle(sector)}
                          />
                          <label 
                            htmlFor={sector} 
                            className={`text-sm font-medium cursor-pointer transition-colors flex-1 ${
                              isAlreadySubscribed 
                                ? 'text-success' 
                                : 'text-text-primary hover:text-gold'
                            }`}
                          >
                            {sector} {isAlreadySubscribed && '✓'}
                          </label>
                          {isAlreadySubscribed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsubscribe(sector)}
                              className="text-text-muted hover:text-destructive h-auto p-1"
                            >
                              <BellOff className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {subSectors.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSectorExpansion(sector)}
                            className="ml-2 h-auto p-1"
                          >
                            {isExpanded ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        )}
                      </div>

                      {/* Subsectors */}
                      {isExpanded && subSectors.length > 0 && (
                        <div className="p-4 pt-0 bg-surface-secondary/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                            {subSectors.map((subSector) => {
                              const isAlreadySubscribedToSub = isSubscribedToSubSector(sector, subSector);
                              const key = `${sector}:${subSector}`;
                              
                              return (
                                <div key={subSector} className="flex items-center justify-between space-x-2">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <Checkbox 
                                      id={key}
                                      checked={selectedSubSectors.includes(key) || isAlreadySubscribedToSub}
                                      disabled={isAlreadySubscribedToSub}
                                      onCheckedChange={() => handleSubSectorToggle(sector, subSector)}
                                    />
                                    <label 
                                      htmlFor={key} 
                                      className={`text-xs cursor-pointer transition-colors ${
                                        isAlreadySubscribedToSub 
                                          ? 'text-success' 
                                          : 'text-text-secondary hover:text-text-primary'
                                      }`}
                                    >
                                      {subSector} {isAlreadySubscribedToSub && '✓'}
                                    </label>
                                  </div>
                                  {isAlreadySubscribedToSub && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUnsubscribe(sector, subSector)}
                                      className="text-text-muted hover:text-destructive h-auto p-1"
                                    >
                                      <BellOff className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleBulkSubscribe}
                  disabled={(selectedSectors.length === 0 && selectedSubSectors.length === 0) || isSubscribing || !user}
                  className="bg-gold hover:bg-gold-hover"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {isSubscribing ? 'Subscribing...' : `Subscribe to ${selectedSectors.length + selectedSubSectors.length} Item(s)`}
                </Button>
                {(selectedSectors.length > 0 || selectedSubSectors.length > 0) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSelectedSectors([]);
                      setSelectedSubSectors([]);
                    }}
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
