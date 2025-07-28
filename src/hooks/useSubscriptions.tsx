import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  GicsCompany,
  Subscription,
  SubscriptionFilters,
  SubscriptionStats,
  isSubscribedToCompany,
  isSubscribedToSector,
  isSubscribedToSubSector,
  subscribeToSectorOrCompany,
  unsubscribeFromSectorOrCompany,
  filterCompanies,
  sortCompanies,
  calculateSubscriptionStats,
  fetchCompaniesAndSubscriptions,
  getUniqueSegments,
  clearAllFilters
} from '@/utils/subscriptionUtils';

export const useSubscriptions = () => {
  // State
  const [companies, setCompanies] = useState<GicsCompany[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<SubscriptionFilters>({
    searchQuery: '',
    sectorFilter: 'all',
    subscriptionFilter: 'all',
    sortBy: 'name'
  });

  const { user, profile } = useAuth();

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      const { companies: fetchedCompanies, subscriptions: fetchedSubscriptions } = 
        await fetchCompaniesAndSubscriptions(profile?.user_id);
      
      setCompanies(fetchedCompanies);
      setSubscriptions(fetchedSubscriptions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed values
  const uniqueSectors = useMemo(() => 
    getUniqueSegments(companies, 'gicsSector'), 
    [companies]
  );

  const filteredAndSortedCompanies = useMemo(() => {
    const filtered = filterCompanies(companies, filters, subscriptions, profile?.user_id);
    return sortCompanies(filtered, filters.sortBy, subscriptions, profile?.user_id);
  }, [companies, filters, subscriptions, profile?.user_id]);

  const stats = useMemo(() => 
    calculateSubscriptionStats(
      companies, 
      subscriptions, 
      uniqueSectors, 
      filteredAndSortedCompanies, 
      profile?.user_id
    ), 
    [companies, subscriptions, uniqueSectors, filteredAndSortedCompanies, profile?.user_id]
  );

  // Subscription check functions
  const checkCompanySubscription = useCallback((company: GicsCompany) => 
    isSubscribedToCompany(company, subscriptions, profile?.user_id), 
    [subscriptions, profile?.user_id]
  );

  const checkSectorSubscription = useCallback((sector: string) => 
    isSubscribedToSector(sector, subscriptions, profile?.user_id), 
    [subscriptions, profile?.user_id]
  );

  const checkSubSectorSubscription = useCallback((sector: string, subSector: string) => 
    isSubscribedToSubSector(sector, subSector, subscriptions, profile?.user_id), 
    [subscriptions, profile?.user_id]
  );

  // Subscription actions
  const handleSubscribe = useCallback(async (
    gicsSector: string,
    gicsSubCategory: string,
    companyId?: string,
    tickerSymbol?: string
  ) => {
    if (!user || !profile) return;

    const loadingKey = companyId || `${gicsSector}-${gicsSubCategory}`;
    setActionLoading(loadingKey);

    try {
      const newSubscription = await subscribeToSectorOrCompany(
        gicsSector,
        gicsSubCategory,
        profile.user_id,
        tickerSymbol
      );
      setSubscriptions(prev => [...prev, newSubscription]);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    } finally {
      setActionLoading(null);
    }
  }, [user, profile]);

  const handleUnsubscribe = useCallback(async (
    gicsSector: string,
    gicsSubCategory?: string,
    companyId?: string,
    tickerSymbol?: string
  ) => {
    if (!user || !profile) return;

    const loadingKey = companyId || `${gicsSector}-${gicsSubCategory || 'sector'}`;
    setActionLoading(loadingKey);

    try {
      await unsubscribeFromSectorOrCompany(
        gicsSector,
        gicsSubCategory,
        profile.user_id,
        tickerSymbol
      );

      // Update local state
      setSubscriptions(prev => {
        const actualGicsSubCategory = tickerSymbol ? `COMPANY:${tickerSymbol}` : gicsSubCategory;
        return prev.filter(sub => 
          !(sub.gicsSector === gicsSector && 
            sub.status === 'ACTIVE' && 
            (actualGicsSubCategory ? sub.gicsSubCategory === actualGicsSubCategory : !sub.gicsSubCategory))
        );
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe');
    } finally {
      setActionLoading(null);
    }
  }, [user, profile]);

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<SubscriptionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(clearAllFilters());
  }, []);

  const updateSearchQuery = useCallback((searchQuery: string) => {
    updateFilters({ searchQuery });
  }, [updateFilters]);

  const updateSectorFilter = useCallback((sectorFilter: string) => {
    updateFilters({ sectorFilter });
  }, [updateFilters]);

  const updateSubscriptionFilter = useCallback((subscriptionFilter: string) => {
    updateFilters({ subscriptionFilter });
  }, [updateFilters]);

  const updateSortBy = useCallback((sortBy: string) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  // Helper functions
  const isLoading = useCallback((identifier: string) => 
    actionLoading === identifier, 
    [actionLoading]
  );

  const hasActiveFilters = useMemo(() => 
    filters.searchQuery !== '' || 
    filters.sectorFilter !== 'all' || 
    filters.subscriptionFilter !== 'all' || 
    filters.sortBy !== 'name', 
    [filters]
  );

  return {
    // State
    companies,
    subscriptions,
    loading,
    actionLoading,
    filters,
    
    // Computed values
    uniqueSectors,
    filteredAndSortedCompanies,
    stats,
    hasActiveFilters,
    
    // Subscription checks
    checkCompanySubscription,
    checkSectorSubscription,
    checkSubSectorSubscription,
    
    // Actions
    handleSubscribe,
    handleUnsubscribe,
    
    // Filter management
    updateFilters,
    resetFilters,
    updateSearchQuery,
    updateSectorFilter,
    updateSubscriptionFilter,
    updateSortBy,
    
    // Helpers
    isLoading,
    
    // Data refresh
    refetch: fetchData
  };
}; 