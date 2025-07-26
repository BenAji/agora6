import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#64748b'];
const RSVP_LABELS = ['ACCEPTED', 'DECLINED', 'TENTATIVE', 'PENDING'];

const Dashboard: React.FC = () => {
  const [eventCount, setEventCount] = useState(0);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [rsvpStatusData, setRsvpStatusData] = useState<any[]>([]);
  const [eventsPerCompany, setEventsPerCompany] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch events
      const { data: events, error: eventsError } = await supabase.from('events').select('eventID, hostCompany');
      // Fetch RSVPs
      const { data: rsvps, error: rsvpsError } = await supabase.from('rsvps').select('status');
      // Fetch companies
      const { data: companies, error: companiesError } = await supabase.from('gics_companies').select('companyName');

      if (eventsError || rsvpsError || companiesError) {
        setLoading(false);
        return;
      }

      setEventCount(events.length);
      setRsvpCount(rsvps.length);

      // RSVP status breakdown
      const rsvpStatusCounts = RSVP_LABELS.map(label => ({
        name: label.charAt(0) + label.slice(1).toLowerCase(),
        value: rsvps.filter(r => r.status === label).length
      }));
      setRsvpStatusData(rsvpStatusCounts);

      // Events per company
      const companyEventMap: Record<string, number> = {};
      events.forEach(e => {
        if (e.hostCompany) {
          companyEventMap[e.hostCompany] = (companyEventMap[e.hostCompany] || 0) + 1;
        }
      });
      const eventsPerCompanyArr = Object.entries(companyEventMap).map(([name, value]) => ({ name, value }));
      setEventsPerCompany(eventsPerCompanyArr);

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Layout currentPage="dashboard">
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gold mb-8">Dashboard Analytics</h1>
          {loading ? (
            <div className="text-gold">Loading analytics...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-surface-primary border-border-default">
                  <CardHeader>
                    <CardTitle className="text-gold">Total Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-text-primary">{eventCount}</div>
                  </CardContent>
                </Card>
                <Card className="bg-surface-primary border-border-default">
                  <CardHeader>
                    <CardTitle className="text-gold">Total RSVPs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-text-primary">{rsvpCount}</div>
                  </CardContent>
                </Card>
                <Card className="bg-surface-primary border-border-default">
                  <CardHeader>
                    <CardTitle className="text-gold">Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-text-primary">{eventsPerCompany.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-surface-primary border-border-default">
                  <CardHeader>
                    <CardTitle className="text-gold">RSVP Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={rsvpStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {rsvpStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-surface-primary border-border-default">
                  <CardHeader>
                    <CardTitle className="text-gold">Events per Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={eventsPerCompany} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#B8860B" tick={{ fill: '#B8860B', fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis stroke="#B8860B" tick={{ fill: '#B8860B', fontSize: 12 }} />
                        <Bar dataKey="value" fill="#22c55e" />
                        <RechartsTooltip />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;