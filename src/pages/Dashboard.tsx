import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/DashboardStats';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CalendarIcon, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CreateEventDialog from '@/components/CreateEventDialog';

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('startDate', { ascending: true })
        .limit(6);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateEvents = profile?.role === 'IR_ADMIN';

  const handleViewDetails = (event: any) => {
    // Navigate to the event details page or open a modal
    console.log('View event details:', event);
    // For now, you could navigate to /events or open a detailed modal
    window.location.href = '/events';
  };

  return (
    <Layout currentPage="dashboard">
      <div className="p-8 space-y-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Dashboard</h1>
            <p className="text-text-secondary">
              Real-time insights and analytics for your IR events
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="terminal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
            {canCreateEvents && (
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Recent Events */}
        <Card variant="terminal">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-gold">Recent Events</CardTitle>
              <Button variant="ghost" size="sm">
                View All Events
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-text-secondary">Loading events...</div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-text-secondary mb-4">No events found</div>
                {canCreateEvents && (
                  <Button onClick={() => setCreateEventOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard 
                    key={event.eventID} 
                    event={{
                      id: event.eventID,
                      title: event.eventName,
                      type: event.eventType,
                      company: event.hostCompany || 'TBD',
                      date: new Date(event.startDate).toLocaleDateString(),
                      time: new Date(event.startDate).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }),
                      location: event.location || 'TBD',
                      attendees: 0,
                      status: 'upcoming' as const,
                      rsvpStatus: 'pending' as const,
                    }} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {canCreateEvents && (
          <CreateEventDialog 
            open={createEventOpen} 
            onOpenChange={setCreateEventOpen}
            onEventCreated={fetchEvents}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;