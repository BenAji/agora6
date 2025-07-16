import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, TrendingUp, Calendar, Clock, MapPin, Building2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  rsvpStatus?: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'PENDING';
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [isRSVPing, setIsRSVPing] = useState(false);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('startDate', { ascending: true });

      if (error) throw error;
      
      // Fetch RSVP status for each event if user is logged in
      if (user && data) {
        const eventsWithRSVP = await Promise.all(
          data.map(async (event) => {
            const { data: rsvp } = await supabase
              .from('rsvps')
              .select('status')
              .eq('eventID', event.eventID)
              .eq('userID', user.id)
              .single();
            
            return {
              ...event,
              rsvpStatus: rsvp?.status || undefined
            };
          })
        );
        setEvents(eventsWithRSVP);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.hostCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (eventCard: any) => {
    // Find the original event from our events array using the eventCard id
    const originalEvent = events.find(e => e.eventID === eventCard.id);
    if (originalEvent) {
      setSelectedEvent(originalEvent);
      setViewDetailsOpen(true);
    }
  };

  const handleRSVPUpdate = () => {
    fetchEvents(); // Refresh events to get updated RSVP status
  };

  const handleDetailRSVP = async (status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    if (!user || !selectedEvent) {
      toast({
        title: "Authentication Required",
        description: "Please log in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    setIsRSVPing(true);
    try {
      // Check if user already has an RSVP for this event
      const { data: existingRSVP, error: fetchError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('eventID', selectedEvent.eventID)
        .eq('userID', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingRSVP) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from('rsvps')
          .update({ 
            status: status,
            updatedAt: new Date().toISOString()
          })
          .eq('rsvpID', existingRSVP.rsvpID);

        if (updateError) throw updateError;
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase
          .from('rsvps')
          .insert([{
            eventID: selectedEvent.eventID,
            userID: user.id,
            status: status
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "RSVP Updated",
        description: `Your RSVP status has been set to ${status.toLowerCase()}`,
      });

      fetchEvents(); // Refresh events to get updated RSVP status
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRSVPing(false);
    }
  };

  const isEventPast = (eventDate: string) => {
    const event = new Date(eventDate);
    const now = new Date();
    return event < now;
  };

  const canCreateEvents = profile?.role === 'IR_ADMIN';

  return (
    <Layout currentPage="events">
      <div className="p-8 space-y-6">
        {/* Events Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Events</h1>
            <p className="text-text-secondary">
              Manage and track all investor relations events
            </p>
          </div>
          <Button variant="ghost">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Search and Filters */}
        <Card variant="terminal">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input 
                  placeholder="Search events, companies, or types..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="terminal">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              {canCreateEvents && (
                <Button onClick={() => setCreateEventOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Event
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading events...</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-secondary mb-4">
              {searchTerm ? 'No events match your search' : 'No events found'}
            </div>
            {canCreateEvents && !searchTerm && (
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
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
                  rsvpStatus: event.rsvpStatus?.toLowerCase() as 'accepted' | 'declined' | 'tentative' | 'pending' | undefined,
                  description: event.description,
                  startDate: event.startDate,
                  endDate: event.endDate
                }}
                onViewDetails={handleViewDetails}
                onRSVPUpdate={handleRSVPUpdate}
              />
            ))}
          </div>
        )}

        {/* Event Details Modal */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gold">{selectedEvent?.eventName}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-gold border-gold">
                    {selectedEvent.eventType?.replace('_', ' ')}
                  </Badge>
                  {selectedEvent.rsvpStatus && (
                    <Badge variant="outline" className="text-success border-success">
                      RSVP: {selectedEvent.rsvpStatus}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Building2 className="mr-2 h-4 w-4 text-gold" />
                      <span className="text-text-secondary">Company:</span>
                      <span className="ml-2 text-text-primary">{selectedEvent.hostCompany}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gold" />
                      <span className="text-text-secondary">Date:</span>
                      <span className="ml-2 text-text-primary">{new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-gold" />
                      <span className="text-text-secondary">Time:</span>
                      <span className="ml-2 text-text-primary">{new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-gold" />
                      <span className="text-text-secondary">Location:</span>
                      <span className="ml-2 text-text-primary">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-text-primary">
                      <FileText className="mr-2 h-4 w-4 text-gold" />
                      Description
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed pl-6">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* RSVP Actions */}
                {!isEventPast(selectedEvent.startDate) && user && (
                  <div className="border-t border-border-default pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">RSVP to this event:</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-success border-success hover:bg-success hover:text-black"
                          onClick={() => handleDetailRSVP('ACCEPTED')}
                          disabled={isRSVPing}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-error border-error hover:bg-error hover:text-white"
                          onClick={() => handleDetailRSVP('DECLINED')}
                          disabled={isRSVPing}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-warning border-warning hover:bg-warning hover:text-black"
                          onClick={() => handleDetailRSVP('TENTATIVE')}
                          disabled={isRSVPing}
                        >
                          Tentative
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isEventPast(selectedEvent.startDate) && (
                  <div className="border-t border-border-default pt-4">
                    <div className="text-center">
                      <Badge variant="outline" className="text-text-muted border-text-muted">
                        This event has ended
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

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

export default Events;