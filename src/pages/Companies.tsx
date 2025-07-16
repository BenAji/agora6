import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  companyID: string;
  companyName: string;
  location: string | null;
  createdAt: string | null;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('user_companies')
          .select('*')
          .order('companyName');

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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
              <h1 className="text-3xl font-bold text-gold mb-2">Companies</h1>
              <p className="text-text-secondary">Manage and view company information</p>
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
                        <Building2 className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-text-primary">{company.companyName}</CardTitle>
                        {company.location && (
                          <div className="flex items-center text-sm text-text-secondary mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {company.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
                    <div className="text-xs text-text-muted">
                      {company.createdAt && new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">No companies found</h3>
              <p className="text-text-muted">Add your first company to get started.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Companies;