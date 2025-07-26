import React from 'react';
import { SubscriptionStats } from '@/utils/subscriptionUtils';

interface StatsHeaderProps {
  title: string;
  description: string;
  stats: SubscriptionStats;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  title,
  description,
  stats
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gold mb-2">{title}</h1>
        <p className="text-text-secondary">{description}</p>
      </div>
      
      {/* Statistics Summary */}
      <div className="flex items-center space-x-6 mt-4 lg:mt-0">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{stats.totalCompanies}</div>
          <div className="text-xs text-text-muted">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{stats.subscribedCompanies}</div>
          <div className="text-xs text-text-muted">Subscribed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-info">{stats.subscribedSectors}/{stats.totalSectors}</div>
          <div className="text-xs text-text-muted">Sectors</div>
        </div>
      </div>
    </div>
  );
}; 