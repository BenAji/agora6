import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { SubscriptionFilters } from '@/utils/subscriptionUtils';

interface FilterControlsProps {
  filters: SubscriptionFilters;
  uniqueSectors: string[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSectorFilterChange: (value: string) => void;
  onSubscriptionFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
  onFilterToggle: (filter: keyof SubscriptionFilters) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  uniqueSectors,
  hasActiveFilters,
  onSearchChange,
  onSectorFilterChange,
  onSubscriptionFilterChange,
  onSortByChange,
  onClearFilters,
  onFilterToggle
}) => {
  const activeFilters = [
    { key: 'searchQuery' as const, label: `"${filters.searchQuery}"`, value: filters.searchQuery },
    { key: 'sectorFilter' as const, label: filters.sectorFilter, value: filters.sectorFilter, exclude: 'all' },
    { key: 'subscriptionFilter' as const, label: filters.subscriptionFilter, value: filters.subscriptionFilter, exclude: 'all' },
    { key: 'sortBy' as const, label: `Sort: ${filters.sortBy}`, value: filters.sortBy, exclude: 'name' }
  ].filter(filter => filter.value && filter.value !== filter.exclude);

  return (
    <Card className="bg-surface-secondary border-border-default">
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search companies, tickers, or sectors..."
              value={filters.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-surface-primary border-border-default"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Filters:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Select value={filters.sectorFilter} onValueChange={onSectorFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-surface-primary border-border-default">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {uniqueSectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.subscriptionFilter} onValueChange={onSubscriptionFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-surface-primary border-border-default">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="subscribed">Subscribed Only</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-full sm:w-48 bg-surface-primary border-border-default">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Company Name</SelectItem>
                <SelectItem value="ticker">Ticker Symbol</SelectItem>
                <SelectItem value="sector">Sector</SelectItem>
                <SelectItem value="subsector">Sub-sector</SelectItem>
                <SelectItem value="subscription">Subscription Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-default">
            <span className="text-xs text-text-muted">Active:</span>
            {activeFilters.map((filter) => (
              <Badge key={filter.key} variant="secondary" className="text-xs">
                {filter.label}
                <button 
                  onClick={() => onFilterToggle(filter.key)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs h-6 px-2 text-text-muted hover:text-destructive"
            >
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 