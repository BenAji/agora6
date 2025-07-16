import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  companyID: string;
  companyName: string;
  location: string;
  createdAt: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select('*')
        .order('companyName', { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout currentPage="companies">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Companies</h1>
            <p className="text-text-secondary">
              Manage and view company information in your network
            </p>
          </div>
        </div>

        {/* Search */}
        <Card variant="terminal">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                placeholder="Search companies by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="terminal">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-surface-secondary rounded"></div>
                    <div className="h-3 bg-surface-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCompanies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm ? 'No companies found' : 'No companies available'}
              </h3>
              <p className="text-text-secondary">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Companies will appear here when they are added to the system.'}
              </p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <Card key={company.companyID} variant="terminal" className="hover:bg-surface-secondary transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gold truncate">
                          {company.companyName}
                        </h3>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.location && (
                    <div className="flex items-center space-x-2 text-text-secondary">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{company.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Summary */}
        <Card variant="terminal">
          <CardHeader>
            <CardTitle className="text-gold">Company Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">{companies.length}</div>
                <div className="text-sm text-text-secondary">Total Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {new Set(companies.map(c => c.location?.split(',')[1]?.trim()).filter(Boolean)).size}
                </div>
                <div className="text-sm text-text-secondary">Unique Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {companies.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-sm text-text-secondary">Added This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Companies;