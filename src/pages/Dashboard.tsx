import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/DashboardStats';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, CalendarIcon, Clock, MapPin, Users, Building2 } from 'lucide-react';
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

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
    const fullEvent = events.find(e => e.eventID === event.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setEventDetailsOpen(true);
    }
  };

  const handleViewAllEvents = () => {
    navigate('/events');
  };

  const getEventStatus = (startDate: string, endDate: string | null) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'ongoing';
    return 'upcoming';
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
            <Button variant="terminal" onClick={() => navigate('/calendar')}>
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
              <Button variant="ghost" size="sm" onClick={handleViewAllEvents}>
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
                      status: getEventStatus(event.startDate, event.endDate),
                      rsvpStatus: 'pending' as const,
                      startDate: event.startDate,
                      endDate: event.endDate,
                      description: event.description,
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

        {/* Event Details Dialog */}
        <Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
          <DialogContent className="max-w-2xl bg-surface-primary border border-border-default">
            <DialogHeader>
              <DialogTitle className="text-gold text-xl">
                {selectedEvent?.eventName}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Badge className="bg-chart-quaternary text-black">
                    {selectedEvent.eventType}
                  </Badge>
                  <Badge className={`text-black ${
                    getEventStatus(selectedEvent.startDate, selectedEvent.endDate) === 'completed' 
                      ? 'bg-text-muted' 
                      : getEventStatus(selectedEvent.startDate, selectedEvent.endDate) === 'ongoing'
                      ? 'bg-success'
                      : 'bg-chart-quaternary'
                  }`}>
                    {getEventStatus(selectedEvent.startDate, selectedEvent.endDate)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-text-secondary">
                    <Building2 className="mr-3 h-5 w-5 text-gold" />
                    <div>
                      <div className="text-sm font-medium">Company</div>
                      <div>{selectedEvent.hostCompany || 'TBD'}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-text-secondary">
                    <CalendarIcon className="mr-3 h-5 w-5 text-gold" />
                    <div>
                      <div className="text-sm font-medium">Date & Time</div>
                      <div>{new Date(selectedEvent.startDate).toLocaleDateString()}</div>
                      <div className="text-sm">{new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-text-secondary">
                    <MapPin className="mr-3 h-5 w-5 text-gold" />
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div>{selectedEvent.location || 'TBD'}</div>
                    </div>
                  </div>

                  {selectedEvent.endDate && (
                    <div className="flex items-center text-text-secondary">
                      <Clock className="mr-3 h-5 w-5 text-gold" />
                      <div>
                        <div className="text-sm font-medium">End Date</div>
                        <div>{new Date(selectedEvent.endDate).toLocaleDateString()}</div>
                        <div className="text-sm">{new Date(selectedEvent.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div>
                    <div className="text-sm font-medium text-text-secondary mb-2">Description</div>
                    <div className="text-text-primary bg-surface-secondary p-4 rounded-lg border border-border-default">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;