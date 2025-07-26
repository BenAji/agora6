import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ExternalLink, Bell, BellOff, TrendingUp, Loader2 } from 'lucide-react';
import { GicsCompany } from '@/utils/subscriptionUtils';

interface CompanyCardProps {
  company: GicsCompany;
  isSubscribed: boolean;
  isLoading: boolean;
  onSubscribe: (gicsSector: string, gicsSubCategory: string, companyId: string, tickerSymbol: string) => void;
  onUnsubscribe: (gicsSector: string, gicsSubCategory: string | undefined, companyId: string, tickerSymbol: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSubscribed,
  isLoading,
  onSubscribe,
  onUnsubscribe
}) => {
  const handleSubscribe = () => {
    onSubscribe(company.gicsSector, company.gicsSubCategory, company.companyID, company.tickerSymbol);
  };

  const handleUnsubscribe = () => {
    onUnsubscribe(company.gicsSector, company.gicsSubCategory, company.companyID, company.tickerSymbol);
  };

  return (
    <Card 
      className={`bg-surface-primary border-border-default hover:border-gold/30 transition-all duration-200 ${
        isSubscribed ? 'ring-1 ring-success/20' : ''
      }`}
    >
      <CardContent className="p-4">
        {/* Company Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
              isSubscribed ? 'bg-success/20' : 'bg-gold/10'
            }`}>
              <TrendingUp className={`h-5 w-5 ${isSubscribed ? 'text-success' : 'text-gold'}`} />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary text-sm truncate">
                {company.companyName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-mono ${
                    isSubscribed ? 'border-success/30 text-success' : 'border-gold/30 text-gold'
                  }`}
                >
                  {company.tickerSymbol}
                </Badge>
                {isSubscribed && (
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    ✓
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Company Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-text-secondary">
            <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{company.gicsSector}</span>
          </div>
          <div className="flex items-center text-xs text-text-secondary">
            <span className="truncate">{company.gicsSubCategory}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <BellOff className="mr-1 h-3 w-3" />
              )}
              Unsubscribe
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1 bg-gold hover:bg-gold-hover text-background text-xs"
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Bell className="mr-1 h-3 w-3" />
              )}
              Subscribe
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 