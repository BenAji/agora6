import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, TrendingUp, Calendar, User, X, Grid3X3, List, Clock, Building2, MapPin, Eye, CheckCircle, XCircle, AlertCircle, Minus } from 'lucide-react';
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

type FilterType = 'all' | 'upcoming' | 'my-events' | 'needs-response';
type SortType = 'date' | 'name' | 'company';
type ViewType = 'cards' | 'list' | 'compact';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Set enhanced List view as default
  const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [viewType, setViewType] = useState<ViewType>('list');
  
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [selectedEventIDs, setSelectedEventIDs] = useState<string[]>([]);
  
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canCreateEvents = profile?.role === 'IR_ADMIN';
  const canBulkRSVP = selectedEventIDs.length > 0;

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
      if (profile && data) {
        console.log('Fetching RSVPs for profile:', { profileId: profile.id, userId: profile.user_id });
        
        const eventsWithRSVP = await Promise.all(
          data.map(async (event) => {
            // Try profile.id first, then profile.user_id if no results
            let { data: rsvp, error: rsvpError } = await supabase
              .from('rsvps')
              .select('status, userID')
              .eq('eventID', event.eventID)
              .eq('userID', profile.id)
              .maybeSingle();
            
            // If no RSVP found with profile.id, try with profile.user_id
            if (!rsvp && profile.user_id && profile.user_id !== profile.id) {
              const { data: rsvp2, error: rsvpError2 } = await supabase
                .from('rsvps')
                .select('status, userID')
                .eq('eventID', event.eventID)
                .eq('userID', profile.user_id)
                .maybeSingle();
              
              rsvp = rsvp2;
              rsvpError = rsvpError2;
              console.log(`Tried profile.user_id for event ${event.eventID}:`, { rsvp: rsvp2, rsvpError: rsvpError2 });
            }
            
            console.log(`RSVP for event ${event.eventID}:`, { rsvp, rsvpError, eventName: event.eventName });
            
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

  // Simplified filtering and sorting logic
  const processedEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.hostCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tickerSymbol?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply main filter
      const now = new Date();
    switch (activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.startDate) >= now);
        break;
      case 'my-events':
        console.log('Filtering My Events from:', events.length, 'events');
        console.log('Events with RSVP status:', events.map(e => ({ name: e.eventName, rsvpStatus: e.rsvpStatus })));
        filtered = filtered.filter(event => 
          event.rsvpStatus && ['ACCEPTED', 'TENTATIVE'].includes(event.rsvpStatus)
        );
        console.log('My Events after filtering:', filtered.length, 'events');
        break;
      case 'needs-response':
        filtered = filtered.filter(event => 
          !event.rsvpStatus && new Date(event.startDate) >= now
        );
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.eventName.localeCompare(b.eventName));
        break;
      case 'company':
        filtered.sort((a, b) => (a.hostCompany || '').localeCompare(b.hostCompany || ''));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
    }

    return filtered;
  }, [events, searchTerm, activeFilter, sortBy]);

  // Get filter counts for display
  const filterCounts = useMemo(() => {
    const now = new Date();
    return {
      all: events.length,
      upcoming: events.filter(e => new Date(e.startDate) >= now).length,
      'my-events': events.filter(e => e.rsvpStatus && ['ACCEPTED', 'TENTATIVE'].includes(e.rsvpStatus)).length,
      'needs-response': events.filter(e => !e.rsvpStatus && new Date(e.startDate) >= now).length,
    };
  }, [events]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleBulkRSVP = async (status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    if (!profile || selectedEventIDs.length === 0) return;

    try {
      setIsRSVPing(true);
      const rsvpPromises = selectedEventIDs.map(eventID =>
        supabase.from('rsvps').upsert({
          eventID,
          userID: profile.id, // Use profile.id as it matches the database foreign key
          status,
          rsvpDate: new Date().toISOString()
        })
      );

      await Promise.all(rsvpPromises);

      toast({
        title: "RSVP Updated",
        description: `Updated RSVP for ${selectedEventIDs.length} event(s) to ${status.toLowerCase()}`,
      });

      setSelectedEventIDs([]);
      fetchEvents();
    } catch (error) {
      console.error('Error updating RSVPs:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVPs",
        variant: "destructive",
      });
    } finally {
      setIsRSVPing(false);
    }
  };

  const toggleEventSelection = (eventID: string) => {
    setSelectedEventIDs(prev =>
      prev.includes(eventID)
        ? prev.filter(id => id !== eventID)
        : [...prev, eventID]
    );
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setViewDetailsOpen(true);
  };

  const handleQuickRSVP = async (eventID: string, status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    if (!profile) return;

    try {
      setIsRSVPing(true);
      await supabase.from('rsvps').upsert({
        eventID,
        userID: profile.id,
        status,
        rsvpDate: new Date().toISOString()
      });

      toast({
        title: "RSVP Updated",
        description: `RSVP set to ${status.toLowerCase()}`,
      });

      // Update local state for immediate UI feedback
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.eventID === eventID 
            ? { ...event, rsvpStatus: status }
            : event
        )
      );
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    } finally {
      setIsRSVPing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getRSVPIcon = (status?: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DECLINED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'TENTATIVE': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get event timing status
  const getEventTimingStatus = (startDate: string, endDate?: string) => {
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

  // Get RSVP status badge
  const getRSVPStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1.5 py-0.5">Accepted</Badge>;
      case 'DECLINED':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-1.5 py-0.5">Declined</Badge>;
      case 'TENTATIVE':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-1.5 py-0.5">Tentative</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-1.5 py-0.5">Pending</Badge>;
    }
  };

  // Get event timing badge
  const getEventTimingBadge = (startDate: string, endDate?: string) => {
    const status = getEventTimingStatus(startDate, endDate);
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-1.5 py-0.5">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-gold/20 text-amber-800 border-amber-200 text-xs px-1.5 py-0.5">Live</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-1.5 py-0.5">Completed</Badge>;
    }
  };

  const renderCompactView = () => (
    <Card className="bg-black border-zinc-800">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-8 pl-4 text-gold">
                <input
                  type="checkbox"
                  checked={selectedEventIDs.length === processedEvents.length && processedEvents.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEventIDs(processedEvents.map(event => event.eventID));
                    } else {
                      setSelectedEventIDs([]);
                    }
                  }}
                  className="rounded border-zinc-600"
                />
              </TableHead>
              <TableHead className="w-16 text-gold text-xs">RSVP</TableHead>
              <TableHead className="min-w-[200px] text-gold text-xs">Event</TableHead>
              <TableHead className="w-32 text-gold text-xs">Company</TableHead>
              <TableHead className="w-24 text-gold text-xs">Ticker</TableHead>
              <TableHead className="w-32 text-gold text-xs">Date</TableHead>
              <TableHead className="w-20 text-gold text-xs">Time</TableHead>
              <TableHead className="w-28 text-gold text-xs">Type</TableHead>
              <TableHead className="w-32 text-gold text-xs">Location</TableHead>
              <TableHead className="w-24 text-gold text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedEvents.map((event) => {
              const isUpcoming = new Date(event.startDate) > new Date();
  return (
                <TableRow 
                  key={event.eventID} 
                  className="border-zinc-800 hover:bg-zinc-900/50 cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <TableCell className="pl-4">
                    <input
                      type="checkbox"
                      checked={selectedEventIDs.includes(event.eventID)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleEventSelection(event.eventID);
                      }}
                      className="rounded border-zinc-600"
                    />
                  </TableCell>
                  <TableCell>
                    {getRSVPIcon(event.rsvpStatus)}
                  </TableCell>
                  <TableCell className="font-medium text-white text-xs">
                    <div className="max-w-[200px] truncate">
                      {event.eventName}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    <div className="max-w-[120px] truncate">
                      {event.hostCompany}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    {event.tickerSymbol && (
                      <Badge variant="outline" className="text-xs border-gold text-gold">
                        {event.tickerSymbol}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className={`${!isUpcoming ? 'text-zinc-500' : 'text-white'}`}>
                      {formatDate(event.startDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    {formatTime(event.startDate)}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="text-xs bg-zinc-700 text-zinc-200 border-zinc-600">
                      {event.eventType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    <div className="max-w-[120px] truncate">
                      {event.location}
          </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {isUpcoming && !event.rsvpStatus && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-green-600 hover:text-green-500"
                            onClick={() => handleQuickRSVP(event.eventID, 'ACCEPTED')}
                            title="Accept"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-red-600 hover:text-red-500"
                            onClick={() => handleQuickRSVP(event.eventID, 'DECLINED')}
                            title="Decline"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-zinc-400 hover:text-gold"
                        onClick={() => handleEventClick(event)}
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
          </Button>
        </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <div className="space-y-1">
      {processedEvents.map((event) => {
        const isUpcoming = new Date(event.startDate) > new Date();
        return (
          <Card 
            key={event.eventID} 
            className="bg-black border-zinc-800 hover:bg-zinc-950 hover:border-zinc-700 cursor-pointer transition-all duration-200"
            onClick={() => handleEventClick(event)}
          >
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedEventIDs.includes(event.eventID)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleEventSelection(event.eventID);
                    }}
                    className="rounded border-zinc-600 w-3 h-3"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Row 1: Event Name + Primary Tags */}
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-white truncate max-w-[280px] text-xs">
                        {event.eventName}
                      </h3>
                      
                      {/* Primary Status Tags - Inline with title */}
                      <div className="flex items-center space-x-1.5">
                        {event.tickerSymbol && (
                          <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px] px-1 py-0 font-medium leading-none">
                            {event.tickerSymbol}
                          </Badge>
                        )}
                        
                        {/* Event Category */}
                        <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] px-1 py-0 font-normal leading-none">
                          {event.eventType.replace('_', ' ')}
                        </Badge>
                        
                        {/* Timing Status */}
                        {(() => {
                          const status = getEventTimingStatus(event.startDate, event.endDate);
                          switch (status) {
                            case 'upcoming':
                              return <Badge className="bg-blue-900/40 text-blue-300 border-blue-800/50 text-[10px] px-1 py-0 font-normal leading-none">Upcoming</Badge>;
                            case 'ongoing':
                              return <Badge className="bg-amber-900/40 text-amber-300 border-amber-800/50 text-[10px] px-1 py-0 font-normal leading-none">Live</Badge>;
                            case 'completed':
                              return <Badge className="bg-zinc-700/40 text-zinc-400 border-zinc-600/50 text-[10px] px-1 py-0 font-normal leading-none">Done</Badge>;
                          }
                        })()}
                        
                        {/* RSVP Status */}
                        {(() => {
                          switch (event.rsvpStatus) {
                            case 'ACCEPTED':
                              return <Badge className="bg-green-900/40 text-green-300 border-green-800/50 text-[10px] px-1 py-0 font-normal leading-none">✓ Accepted</Badge>;
                            case 'DECLINED':
                              return <Badge className="bg-red-900/40 text-red-300 border-red-800/50 text-[10px] px-1 py-0 font-normal leading-none">✗ Declined</Badge>;
                            case 'TENTATIVE':
                              return <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50 text-[10px] px-1 py-0 font-normal leading-none">? Tentative</Badge>;
                            default:
                              return <Badge className="bg-zinc-700/40 text-zinc-400 border-zinc-600/50 text-[10px] px-1 py-0 font-normal leading-none">○ Pending</Badge>;
                          }
                        })()}
                      </div>
                          </div>

                    {/* Row 2: Event Details */}
                    <div className="flex items-center space-x-3 text-[10px] text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-2.5 w-2.5 text-gold flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{event.hostCompany}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Calendar className="h-2.5 w-2.5 text-gold flex-shrink-0" />
                        <span className={`whitespace-nowrap ${!isUpcoming ? 'text-zinc-500' : 'text-zinc-300'}`}>
                          {formatDate(event.startDate)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Clock className="h-2.5 w-2.5 text-gold flex-shrink-0" />
                        <span className="whitespace-nowrap text-zinc-300">{formatTime(event.startDate)}</span>
                        </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-2.5 w-2.5 text-gold flex-shrink-0" />
                        <span className="truncate max-w-[100px] text-zinc-300">{event.location}</span>
                        </div>
                    </div>
                  </div>
              </div>
              
                {/* Action Buttons - Compact */}
                <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  {isUpcoming && !event.rsvpStatus && (
                    <>
                <Button
                  size="sm"
                        variant="ghost"
                        className="text-green-500 hover:text-green-400 hover:bg-green-500/10 px-1.5 py-0.5 h-5 text-[10px] font-medium"
                        onClick={() => handleQuickRSVP(event.eventID, 'ACCEPTED')}
                        disabled={isRSVPing}
                >
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                        Accept
                </Button>
                <Button
                  size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 h-5 text-[10px] font-medium"
                        onClick={() => handleQuickRSVP(event.eventID, 'DECLINED')}
                        disabled={isRSVPing}
                >
                        <XCircle className="h-2.5 w-2.5 mr-0.5" />
                        Decline
                </Button>
                    </>
                  )}
                <Button
                  size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-gold hover:bg-gold/10 px-1.5 py-0.5 h-5 text-[10px] font-medium"
                    onClick={() => handleEventClick(event)}
                >
                    <Eye className="h-2.5 w-2.5 mr-0.5" />
                    View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
          </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {processedEvents.map((event) => (
              <div key={event.eventID} className="relative">
                {canBulkRSVP && (
            <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedEventIDs.includes(event.eventID)}
                onChange={() => toggleEventSelection(event.eventID)}
                className="rounded border-zinc-600"
              />
            </div>
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
              status: new Date(event.startDate) > new Date() ? 'upcoming' : 'completed',
                    rsvpStatus: event.rsvpStatus?.toLowerCase() as 'accepted' | 'declined' | 'tentative' | 'pending' | undefined,
                    description: event.description,
                    startDate: event.startDate,
                    endDate: event.endDate
                  }}
            onViewDetails={() => handleEventClick(event)}
            onRSVPUpdate={fetchEvents}
                />
              </div>
            ))}
          </div>
  );

  return (
    <Layout currentPage="events">
      <div className="px-6 py-4 space-y-4 bg-black min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gold">Investment Events</h1>
            <p className="text-sm text-zinc-400">
              {processedEvents.length} of {events.length} events • {filterCounts['needs-response']} need response
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canCreateEvents && (
              <Button onClick={() => setCreateEventOpen(true)} size="sm" className="bg-gold text-black hover:bg-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="bg-black border-zinc-800">
          <CardContent className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search events, companies, tickers..." 
                className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-zinc-400 hover:text-gold"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter and Sort Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { key: 'upcoming' as FilterType, label: 'Upcoming', count: filterCounts.upcoming },
                  { key: 'needs-response' as FilterType, label: 'Need Response', count: filterCounts['needs-response'] },
                  { key: 'my-events' as FilterType, label: 'My Events', count: filterCounts['my-events'] },
                  { key: 'all' as FilterType, label: 'All', count: filterCounts.all },
                ].map(filter => (
                  <Button
                    key={filter.key}
                    variant={activeFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`${
                      activeFilter === filter.key 
                        ? 'bg-gold text-black hover:bg-gold/90' 
                        : 'border-zinc-700 text-zinc-300 hover:text-gold hover:border-gold'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </Button>
                ))}
              </div>

              {/* Sort Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
                  <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="date" className="text-white hover:bg-zinc-800">Date</SelectItem>
                    <SelectItem value="name" className="text-white hover:bg-zinc-800">Name</SelectItem>
                    <SelectItem value="company" className="text-white hover:bg-zinc-800">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Display - Enhanced List View Only */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-sm text-zinc-400">Loading events...</div>
          </div>
        ) : processedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-sm text-zinc-400 mb-3">
              {searchTerm ? `No events found for "${searchTerm}"` : 'No events found for this filter'}
            </div>
            {searchTerm && (
              <Button variant="outline" size="sm" onClick={clearSearch} className="border-zinc-700 text-zinc-300 hover:text-gold hover:border-gold">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          renderListView()
        )}

        {/* Bulk RSVP Bar */}
        {canBulkRSVP && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black border border-zinc-700 rounded-lg shadow-lg px-4 py-3 z-50">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">
                {selectedEventIDs.length} selected
              </span>
              <Separator orientation="vertical" className="h-4 bg-zinc-700" />
              <Button
                size="sm"
                onClick={() => handleBulkRSVP('ACCEPTED')}
                disabled={isRSVPing}
                className="bg-gold text-black hover:bg-gold/90"
              >
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkRSVP('DECLINED')}
                disabled={isRSVPing}
                className="border-zinc-700 text-zinc-300 hover:text-gold hover:border-gold"
              >
                Decline All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedEventIDs([])}
                className="text-zinc-400 hover:text-gold"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Create Event Dialog */}
        <CreateEventDialog
          open={createEventOpen}
          onOpenChange={setCreateEventOpen}
          onEventCreated={fetchEvents}
        />

        {/* Event Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="bg-black border-zinc-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gold">Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedEvent.eventName}</h3>
                  <p className="text-sm text-zinc-400">{selectedEvent.hostCompany}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gold">Type:</span>
                    <p className="text-zinc-300">{selectedEvent.eventType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gold">Date:</span>
                    <p className="text-zinc-300">
                      {new Date(selectedEvent.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gold">Time:</span>
                    <p className="text-zinc-300">
                      {new Date(selectedEvent.startDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gold">Location:</span>
                    <p className="text-zinc-300">{selectedEvent.location}</p>
                  </div>
                    </div>
                {selectedEvent.description && (
                  <div>
                    <span className="font-medium text-gold">Description:</span>
                    <p className="text-sm text-zinc-300 mt-2">{selectedEvent.description}</p>
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

export default Events;