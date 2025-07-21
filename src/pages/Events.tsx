import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Plus, TrendingUp, Calendar, Clock, MapPin, Building2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CreateEventDialog from '@/components/CreateEventDialog';
import { useNavigate } from 'react-router-dom';

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  tickerSymbol?: string;
  gicsSector?: string;
  gicsSubSector?: string;
  rsvpStatus?: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'PENDING';
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTickerSymbols, setSelectedTickerSymbols] = useState<string[]>([]);
  const [selectedGicsSectors, setSelectedGicsSectors] = useState<string[]>([]);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [selectedEventIDs, setSelectedEventIDs] = useState<string[]>([]);
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.hostCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Event status filter (upcoming/past/all)
    let matchesTimeFilter = true;
    if (eventFilter === 'upcoming') {
      const eventDate = new Date(event.startDate);
      const now = new Date();
      matchesTimeFilter = eventDate >= now;
    } else if (eventFilter === 'past') {
      const eventDate = new Date(event.startDate);
      const now = new Date();
      matchesTimeFilter = eventDate < now;
    }
    
    // Advanced filters
    const matchesEventType = selectedEventTypes.length === 0 || selectedEventTypes.includes(event.eventType);
    const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(event.hostCompany || '');
    const matchesTickerSymbol = selectedTickerSymbols.length === 0 || selectedTickerSymbols.includes(event.tickerSymbol || '');
    const matchesGicsSector = selectedGicsSectors.length === 0 || selectedGicsSectors.includes(event.gicsSector || '');
    
    return matchesSearch && matchesTimeFilter && matchesEventType && matchesCompany && matchesTickerSymbol && matchesGicsSector;
  });

  // Get unique filter options from events
  const uniqueEventTypes = [...new Set(events.map(e => e.eventType).filter(Boolean))];
  const uniqueCompanies = [...new Set(events.map(e => e.hostCompany).filter(Boolean))];
  const uniqueTickerSymbols = [...new Set(events.map(e => e.tickerSymbol).filter(Boolean))];
  const uniqueGicsSectors = [...new Set(events.map(e => e.gicsSector).filter(Boolean))];

  const clearAllFilters = () => {
    setSelectedEventTypes([]);
    setSelectedCompanies([]);
    setSelectedTickerSymbols([]);
    setSelectedGicsSectors([]);
  };

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

  const handleBulkRSVP = async (status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    if (!user || selectedEventIDs.length === 0) return;
    setIsRSVPing(true);
    try {
      for (const eventID of selectedEventIDs) {
        // Check if RSVP exists
        const { data: existingRSVP } = await supabase
          .from('rsvps')
          .select('rsvpID')
          .eq('eventID', eventID)
          .eq('userID', user.id)
          .single();
        if (existingRSVP) {
          await supabase
            .from('rsvps')
            .update({ status, updatedAt: new Date().toISOString() })
            .eq('rsvpID', existingRSVP.rsvpID);
        } else {
          await supabase
            .from('rsvps')
            .insert([{ eventID, userID: user.id, status }]);
        }
      }
      toast({ title: 'Bulk RSVP Updated', description: `Set ${status.toLowerCase()} for ${selectedEventIDs.length} events.` });
      setSelectedEventIDs([]);
      fetchEvents();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update RSVP for some events.', variant: 'destructive' });
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
  const canBulkRSVP = profile?.role === 'ANALYST_MANAGER' || profile?.role === 'INVESTMENT_ANALYST';

  const getEventStatus = (startDate: string, endDate?: string): 'upcoming' | 'ongoing' | 'completed' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

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
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Search and Filters */}
        <Card variant="terminal">
          <CardContent className="p-6">
            <div className="space-y-4">
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="terminal">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                      {(selectedEventTypes.length + selectedCompanies.length + selectedTickerSymbols.length + selectedGicsSectors.length) > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {selectedEventTypes.length + selectedCompanies.length + selectedTickerSymbols.length + selectedGicsSectors.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-surface-primary border border-border-default p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-text-primary">Advanced Filters</h4>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                          Clear All
                        </Button>
                      </div>

                      {/* Event Type Filter */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-text-secondary">Event Type</h5>
                        {uniqueEventTypes.map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedEventTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEventTypes([...selectedEventTypes, type]);
                                } else {
                                  setSelectedEventTypes(selectedEventTypes.filter(t => t !== type));
                                }
                              }}
                            />
                            <label htmlFor={`type-${type}`} className="text-xs text-text-primary">
                              {type.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Company Filter */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-text-secondary">Company</h5>
                        {uniqueCompanies.map(company => (
                          <div key={company} className="flex items-center space-x-2">
                            <Checkbox
                              id={`company-${company}`}
                              checked={selectedCompanies.includes(company)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCompanies([...selectedCompanies, company]);
                                } else {
                                  setSelectedCompanies(selectedCompanies.filter(c => c !== company));
                                }
                              }}
                            />
                            <label htmlFor={`company-${company}`} className="text-xs text-text-primary">
                              {company}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Ticker Symbol Filter */}
                      {uniqueTickerSymbols.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-text-secondary">Ticker Symbol</h5>
                          {uniqueTickerSymbols.map(ticker => (
                            <div key={ticker} className="flex items-center space-x-2">
                              <Checkbox
                                id={`ticker-${ticker}`}
                                checked={selectedTickerSymbols.includes(ticker)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTickerSymbols([...selectedTickerSymbols, ticker]);
                                  } else {
                                    setSelectedTickerSymbols(selectedTickerSymbols.filter(t => t !== ticker));
                                  }
                                }}
                              />
                              <label htmlFor={`ticker-${ticker}`} className="text-xs text-text-primary">
                                {ticker}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* GICS Sector Filter */}
                      {uniqueGicsSectors.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-text-secondary">GICS Sector</h5>
                          {uniqueGicsSectors.map(sector => (
                            <div key={sector} className="flex items-center space-x-2">
                              <Checkbox
                                id={`gics-${sector}`}
                                checked={selectedGicsSectors.includes(sector)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedGicsSectors([...selectedGicsSectors, sector]);
                                  } else {
                                    setSelectedGicsSectors(selectedGicsSectors.filter(s => s !== sector));
                                  }
                                }}
                              />
                              <label htmlFor={`gics-${sector}`} className="text-xs text-text-primary">
                                {sector}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {canCreateEvents && (
                  <Button onClick={() => setCreateEventOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Event
                  </Button>
                )}
              </div>
              
              {/* Quick Filter Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={eventFilter === 'upcoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEventFilter('upcoming')}
                >
                  Upcoming ({events.filter(e => new Date(e.startDate) >= new Date()).length})
                </Button>
                <Button
                  variant={eventFilter === 'past' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEventFilter('past')}
                >
                  Past ({events.filter(e => new Date(e.startDate) < new Date()).length})
                </Button>
                <Button
                  variant={eventFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEventFilter('all')}
                >
                  All ({events.length})
                </Button>
              </div>
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
              <div key={event.eventID} className="relative">
                {canBulkRSVP && (
                  <input
                    type="checkbox"
                    className="absolute left-2 top-2 z-10 h-4 w-4"
                    checked={selectedEventIDs.includes(event.eventID)}
                    disabled={isEventPast(event.startDate)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedEventIDs([...selectedEventIDs, event.eventID]);
                      } else {
                        setSelectedEventIDs(selectedEventIDs.filter(id => id !== event.eventID));
                      }
                    }}
                  />
                )}
                <EventCard 
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
                    rsvpStatus: event.rsvpStatus?.toLowerCase() as 'accepted' | 'declined' | 'tentative' | 'pending' | undefined,
                    description: event.description,
                    startDate: event.startDate,
                    endDate: event.endDate
                  }}
                  onViewDetails={handleViewDetails}
                  onRSVPUpdate={handleRSVPUpdate}
                />
              </div>
            ))}
          </div>
        )}

        {canBulkRSVP && selectedEventIDs.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-surface-primary border border-gold rounded-lg shadow-lg flex items-center gap-4 px-6 py-3">
            <span className="text-xs text-gold font-semibold">Bulk RSVP for {selectedEventIDs.length} events:</span>
            <Button size="sm" className="text-success border-success" variant="outline" onClick={() => handleBulkRSVP('ACCEPTED')}>Accept</Button>
            <Button size="sm" className="text-error border-error" variant="outline" onClick={() => handleBulkRSVP('DECLINED')}>Decline</Button>
            <Button size="sm" className="text-warning border-warning" variant="outline" onClick={() => handleBulkRSVP('TENTATIVE')}>Tentative</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedEventIDs([])}>Cancel</Button>
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