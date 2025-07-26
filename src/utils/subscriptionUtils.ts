import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface GicsCompany {
  companyID: string;
  companyName: string;
  tickerSymbol: string;
  gicsSector: string;
  gicsSubCategory: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Subscription {
  subID: string;
  userID: string;
  status: string;
  gicsSector?: string;
  gicsSubCategory?: string;
}

export interface SubscriptionFilters {
  searchQuery: string;
  sectorFilter: string;
  subscriptionFilter: string;
  sortBy: string;
}

export interface SubscriptionStats {
  totalCompanies: number;
  subscribedCompanies: number;
  totalSectors: number;
  subscribedSectors: number;
  subscribedSubSectors: number;
  filteredCompanies: number;
}

// Subscription check utilities
export const isSubscribedToCompany = (
  company: GicsCompany, 
  subscriptions: Subscription[], 
  userProfileId?: string
): boolean => {
  return subscriptions.some(sub => 
    sub.userID === userProfileId && 
    sub.status === 'ACTIVE' &&
    (
      // Sector-level subscription (covers all companies in the sector)
      (sub.gicsSector === company.gicsSector && !sub.gicsSubCategory) ||
      // Subsector-level subscription (covers all companies in the subsector)
      (sub.gicsSector === company.gicsSector && sub.gicsSubCategory === company.gicsSubCategory)
    )
  );
};

export const isSubscribedToSector = (
  sector: string, 
  subscriptions: Subscription[], 
  userProfileId?: string
): boolean => {
  return subscriptions.some(sub => 
    sub.userID === userProfileId && 
    sub.status === 'ACTIVE' &&
    sub.gicsSector === sector &&
    !sub.gicsSubCategory // Sector-level subscription only
  );
};

export const isSubscribedToSubSector = (
  sector: string, 
  subSector: string, 
  subscriptions: Subscription[], 
  userProfileId?: string
): boolean => {
  return subscriptions.some(sub => 
    sub.userID === userProfileId && 
    sub.status === 'ACTIVE' &&
    sub.gicsSector === sector &&
    sub.gicsSubCategory === subSector
  );
};

// Subscription actions
export const subscribeToSectorOrCompany = async (
  gicsSector: string,
  gicsSubCategory: string,
  userProfileId: string,
  tickerSymbol?: string
): Promise<Subscription> => {
  const subscriptionData = {
    userID: userProfileId,
    status: 'ACTIVE' as const,
    subStart: new Date().toISOString(),
    gicsSector: gicsSector,
    gicsSubCategory: gicsSubCategory
  };

  const { error } = await supabase
    .from('subscriptions')
    .insert(subscriptionData);

  if (error) throw error;

  // Return the new subscription for local state update
  const newSubscription: Subscription = {
    subID: crypto.randomUUID(),
    userID: userProfileId,
    status: 'ACTIVE',
    gicsSector: gicsSector,
    gicsSubCategory: gicsSubCategory
  };

  const successMessage = tickerSymbol 
    ? `Subscribed to ${tickerSymbol}` 
    : `Subscribed to ${gicsSector} sector`;
  toast.success(successMessage);

  return newSubscription;
};

export const unsubscribeFromSectorOrCompany = async (
  gicsSector: string,
  gicsSubCategory: string | undefined,
  userProfileId: string,
  tickerSymbol?: string
): Promise<void> => {
  let query = supabase
    .from('subscriptions')
    .update({ status: 'INACTIVE' })
    .eq('userID', userProfileId)
    .eq('status', 'ACTIVE')
    .eq('gicsSector', gicsSector);

  if (gicsSubCategory) {
    query = query.eq('gicsSubCategory', gicsSubCategory);
  } else {
    query = query.is('gicsSubCategory', null);
  }

  const { error } = await query;

  if (error) throw error;

  const itemType = tickerSymbol 
    ? tickerSymbol 
    : gicsSubCategory ? `${gicsSector} - ${gicsSubCategory}` : gicsSector;
  toast.success(`Unsubscribed from ${itemType}`);
};

// Filtering and sorting utilities
export const filterCompanies = (
  companies: GicsCompany[],
  filters: SubscriptionFilters,
  subscriptions: Subscription[],
  userProfileId?: string
): GicsCompany[] => {
  return companies.filter(company => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchFields = [
        company.companyName,
        company.tickerSymbol,
        company.gicsSector,
        company.gicsSubCategory
      ];
      
      const matches = searchFields.some(field => 
        field.toLowerCase().includes(query)
      );
      
      if (!matches) return false;
    }

    // Sector filter
    if (filters.sectorFilter !== 'all' && company.gicsSector !== filters.sectorFilter) {
      return false;
    }

    // Subscription filter
    if (filters.subscriptionFilter !== 'all') {
      const isSubscribed = isSubscribedToCompany(company, subscriptions, userProfileId);
      if (filters.subscriptionFilter === 'subscribed' && !isSubscribed) return false;
      if (filters.subscriptionFilter === 'unsubscribed' && isSubscribed) return false;
    }

    return true;
  });
};

export const sortCompanies = (companies: GicsCompany[], sortBy: string, subscriptions: Subscription[], userProfileId?: string): GicsCompany[] => {
  return [...companies].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.companyName.localeCompare(b.companyName);
      case 'ticker':
        return a.tickerSymbol.localeCompare(b.tickerSymbol);
      case 'sector':
        return a.gicsSector.localeCompare(b.gicsSector) || a.companyName.localeCompare(b.companyName);
      case 'subsector':
        return a.gicsSubCategory.localeCompare(b.gicsSubCategory) || a.companyName.localeCompare(b.companyName);
      case 'subscription':
        const aSubscribed = isSubscribedToCompany(a, subscriptions, userProfileId) ? 1 : 0;
        const bSubscribed = isSubscribedToCompany(b, subscriptions, userProfileId) ? 1 : 0;
        return bSubscribed - aSubscribed || a.companyName.localeCompare(b.companyName);
      default:
        return a.companyName.localeCompare(b.companyName);
    }
  });
};

// Statistics utilities
export const calculateSubscriptionStats = (
  companies: GicsCompany[],
  subscriptions: Subscription[],
  uniqueSectors: string[],
  filteredCompanies: GicsCompany[],
  userProfileId?: string
): SubscriptionStats => {
  const totalCompanies = companies.length;
  const subscribedCompanies = companies.filter(company => 
    isSubscribedToCompany(company, subscriptions, userProfileId)
  ).length;
  const totalSectors = uniqueSectors.length;
  const subscribedSectors = subscriptions.filter(sub => !sub.gicsSubCategory).length;
  const subscribedSubSectors = subscriptions.filter(sub => sub.gicsSubCategory).length;
  
  return {
    totalCompanies,
    subscribedCompanies,
    totalSectors,
    subscribedSectors,
    subscribedSubSectors,
    filteredCompanies: filteredCompanies.length
  };
};

// Data fetching utilities
export const fetchCompaniesAndSubscriptions = async (userProfileId?: string) => {
  const [companiesData, subscriptionsData] = await Promise.all([
    supabase
      .from('gics_companies')
      .select('*')
      .neq('companyName', '') // Filter out empty companies
      .neq('gicsSector', '') // Filter out empty sectors
      .order('companyName'),

    userProfileId ? supabase
      .from('subscriptions')
      .select('subID, userID, status, gicsSector, gicsSubCategory')
      .eq('userID', userProfileId)
      .eq('status', 'ACTIVE') : { data: [], error: null }
  ]);

  if (companiesData.error) throw companiesData.error;
  if (subscriptionsData.error) throw subscriptionsData.error;

  // Filter out companies with empty names or sectors
  const validCompanies = (companiesData.data || []).filter(
    company => company.companyName && company.gicsSector
  );

  return {
    companies: validCompanies,
    subscriptions: subscriptionsData.data || []
  };
};

// Utility functions
export const getUniqueSegments = (companies: GicsCompany[], field: keyof GicsCompany): string[] => {
  return Array.from(
    new Set(
      companies
        .map(company => company[field] as string)
        .filter(value => value && value.trim() !== '')
    )
  ).sort();
};

export const clearAllFilters = (): SubscriptionFilters => ({
  searchQuery: '',
  sectorFilter: 'all',
  subscriptionFilter: 'all',
  sortBy: 'name'
}); 