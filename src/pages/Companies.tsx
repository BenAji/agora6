
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, ChevronDown, ChevronUp, Search, Target, Layers, Bell, BellOff, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CompanyCard } from '@/components/CompanyCard';
import { FilterControls } from '@/components/FilterControls';
import { StatsHeader } from '@/components/StatsHeader';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { clearAllFilters, SubscriptionFilters } from '@/utils/subscriptionUtils';

const Companies: React.FC = () => {
  // Sector management state
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<string[]>([]);
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [sectorCardExpanded, setSectorCardExpanded] = useState(false);

  // Use the optimized subscription hook
  const {
    companies,
    subscriptions,
    loading,
    filters,
    uniqueSectors,
    filteredAndSortedCompanies,
    stats,
    hasActiveFilters,
    checkCompanySubscription,
    checkSectorSubscription,
    checkSubSectorSubscription,
    handleSubscribe,
    handleUnsubscribe,
    updateSearchQuery,
    updateSectorFilter,
    updateSubscriptionFilter,
    updateSortBy,
    resetFilters,
    updateFilters,
    isLoading
  } = useSubscriptions();

  // Sector management functions
  const getSectorSubSectors = (sector: string) => {
    return Array.from(
      new Set(
        companies
          .filter(company => company.gicsSector === sector)
          .map(company => company.gicsSubCategory)
          .filter(subSector => subSector && subSector.trim() !== '')
      )
    ).sort();
  };

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSubSectorToggle = (sector: string, subSector: string) => {
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

  const handleBulkSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const subscribePromises = [
        ...selectedSectors.map(sector => handleSubscribe(sector, '', undefined, undefined)),
        ...selectedSubSectors.map(key => {
          const [sector, subSector] = key.split(':');
          return handleSubscribe(sector, subSector, undefined, undefined);
        })
      ];
      
      await Promise.all(subscribePromises);
      setSelectedSectors([]);
      setSelectedSubSectors([]);
    } catch (error) {
      console.error('Error bulk subscribing:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Filter toggle handlers
  const handleFilterToggle = (filterKey: keyof SubscriptionFilters) => {
    const resetValues = clearAllFilters();
    updateFilters({ [filterKey]: resetValues[filterKey] });
  };

  if (loading) {
    return (
      <Layout currentPage="companies">
        <div className="p-8 bg-background min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="companies">
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header with Statistics */}
          <StatsHeader
            title="GICS Companies"
            description="Browse and subscribe to companies by sector and ticker symbol"
            stats={stats}
          />

          {/* Search and Filter Controls */}
          <FilterControls
            filters={filters}
            uniqueSectors={uniqueSectors}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={updateSearchQuery}
            onSectorFilterChange={updateSectorFilter}
            onSubscriptionFilterChange={updateSubscriptionFilter}
            onSortByChange={updateSortBy}
            onClearFilters={resetFilters}
            onFilterToggle={handleFilterToggle}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Showing {stats.filteredCompanies} of {stats.totalCompanies} companies
            </div>
            {stats.filteredCompanies > 0 && (
              <div className="text-xs text-text-muted">
                {stats.subscribedCompanies} subscribed • {stats.totalCompanies - stats.subscribedCompanies} available
              </div>
            )}
          </div>

          {/* Sector Subscription Section */}
          {uniqueSectors.length > 0 && (
            <Card className="bg-surface-secondary border-border-default">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-text-primary">Sector Subscriptions</CardTitle>
                      <p className="text-sm text-text-secondary">Manage your sector and subsector subscriptions</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSectorCardExpanded(!sectorCardExpanded)}
                    className="h-8 w-8 p-0"
                  >
                    {sectorCardExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {sectorCardExpanded && (
                <CardContent className="pt-0">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-surface-primary rounded-lg border border-border-default">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gold">{uniqueSectors.length}</div>
                      <div className="text-xs text-text-muted">Total Sectors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-success">{subscriptions.filter(sub => !sub.gicsSubCategory).length}</div>
                      <div className="text-xs text-text-muted">Subscribed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-info">{subscriptions.filter(sub => sub.gicsSubCategory).length}</div>
                      <div className="text-xs text-text-muted">Sub-sectors</div>
                    </div>
                  </div>

                  {/* Sector List */}
                  <div className="space-y-3 mb-6">
                    {uniqueSectors.map((sector) => {
                      const isAlreadySubscribed = checkSectorSubscription(sector);
                      const subSectors = getSectorSubSectors(sector);
                      const isExpanded = expandedSectors.includes(sector);
                      const subscribedSubSectors = subSectors.filter(sub => checkSubSectorSubscription(sector, sub)).length;
                      
                      return (
                        <div key={sector} className="border border-border-default rounded-lg overflow-hidden">
                          {/* Sector Header */}
                          <div className="flex items-center justify-between p-4 bg-surface-primary hover:bg-surface-primary/80 transition-colors">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                isAlreadySubscribed ? 'bg-success/20' : 'bg-gold/10'
                              }`}>
                                <Layers className={`h-4 w-4 ${isAlreadySubscribed ? 'text-success' : 'text-gold'}`} />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={sector}
                                    checked={selectedSectors.includes(sector) || isAlreadySubscribed}
                                    disabled={isAlreadySubscribed}
                                    onCheckedChange={() => handleSectorToggle(sector)}
                                    className={isAlreadySubscribed ? "opacity-60 cursor-not-allowed" : ""}
                                  />
                                  <label 
                                    htmlFor={sector} 
                                    className={`text-sm font-medium transition-colors flex-1 ${
                                      isAlreadySubscribed 
                                        ? 'text-success cursor-not-allowed' 
                                        : 'text-text-primary hover:text-gold cursor-pointer'
                                    }`}
                                  >
                                    {sector}
                                  </label>
                                </div>
                                
                                <div className="flex items-center space-x-4 mt-1">
                                  {isAlreadySubscribed && (
                                    <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                                      ✓ Subscribed
                                    </Badge>
                                  )}
                                  {subSectors.length > 0 && (
                                    <span className="text-xs text-text-muted">
                                      {subSectors.length} subsectors
                                      {subscribedSubSectors > 0 && (
                                        <span className="text-success"> • {subscribedSubSectors} subscribed</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isAlreadySubscribed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsubscribe(sector, undefined, undefined, undefined)}
                                  className="text-text-muted hover:text-destructive h-8 w-8 p-0"
                                  title="Unsubscribe from sector"
                                >
                                  <BellOff className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {subSectors.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSectorExpansion(sector)}
                                  className="h-8 w-8 p-0"
                                  title={isExpanded ? "Collapse subsectors" : "Expand subsectors"}
                                >
                                  {isExpanded ? 
                                    <ChevronUp className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                  }
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Subsectors */}
                          {isExpanded && subSectors.length > 0 && (
                            <div className="bg-surface-secondary/30 border-t border-border-default">
                              <div className="p-4">
                                <div className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">
                                  Subsectors
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {subSectors.map((subSector) => {
                                    const isAlreadySubscribedToSub = checkSubSectorSubscription(sector, subSector);
                                    const key = `${sector}:${subSector}`;
                                    
                                    return (
                                      <div key={subSector} className="flex items-center justify-between p-2 rounded-md hover:bg-surface-primary/50 transition-colors">
                                        <div className="flex items-center space-x-2 flex-1">
                                          <Checkbox 
                                            id={key}
                                            checked={selectedSubSectors.includes(key) || isAlreadySubscribedToSub}
                                            disabled={isAlreadySubscribedToSub}
                                            onCheckedChange={() => handleSubSectorToggle(sector, subSector)}
                                            className={isAlreadySubscribedToSub ? "opacity-60 cursor-not-allowed" : ""}
                                          />
                                          <label 
                                            htmlFor={key} 
                                            className={`text-sm transition-colors ${
                                              isAlreadySubscribedToSub 
                                                ? 'text-success cursor-not-allowed' 
                                                : 'text-text-secondary hover:text-text-primary cursor-pointer'
                                            }`}
                                          >
                                            {subSector}
                                          </label>
                                        </div>
                                        
                                        {isAlreadySubscribedToSub && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUnsubscribe(sector, subSector, undefined, undefined)}
                                            className="text-text-muted hover:text-destructive h-6 w-6 p-0"
                                            title="Unsubscribe from subsector"
                                          >
                                            <BellOff className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-border-default">
                    <div className="flex items-center space-x-3">
                      <Button 
                        onClick={handleBulkSubscribe}
                        disabled={(selectedSectors.length === 0 && selectedSubSectors.length === 0) || isSubscribing}
                        className="bg-gold hover:bg-gold-hover text-background"
                      >
                        {isSubscribing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Bell className="mr-2 h-4 w-4" />
                        )}
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
                    
                    <div className="text-xs text-text-muted">
                      {selectedSectors.length + selectedSubSectors.length > 0 && (
                        <span className="text-gold">
                          {selectedSectors.length} sectors, {selectedSubSectors.length} subsectors selected
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedCompanies.map((company) => (
              <CompanyCard
                key={company.companyID}
                company={company}
                isSubscribed={checkCompanySubscription(company)}
                isLoading={isLoading(company.companyID)}
                onSubscribe={handleSubscribe}
                onUnsubscribe={handleUnsubscribe}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedCompanies.length === 0 && !loading && (
            <div className="text-center py-12">
              {companies.length === 0 ? (
                <>
                  <Target className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-secondary mb-2">No GICS companies found</h3>
                  <p className="text-text-muted">GICS company data will appear here once available.</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-secondary mb-2">No companies match your filters</h3>
                  <p className="text-text-muted mb-4">Try adjusting your search terms or filters to see more results.</p>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="text-gold border-gold/30 hover:bg-gold/10"
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Companies;
