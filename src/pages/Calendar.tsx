import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Download, Filter, CalendarDays, ToggleLeft, ToggleRight, Eye, EyeOff, Clock, MapPin, Building2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isToday, addWeeks, subWeeks, getISOWeek } from 'date-fns';

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  endDate?: string;
  location: string;
  description?: string;
  companyID: string;
}

interface Company {
  companyID: string;
  companyName: string;
  tickerSymbol: string;
}

interface Subscription {
  subID: string;
  userID: string;
  status: string;
  gicsSector?: string;
  gicsSubCategory?: string;
}

const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userRSVPs, setUserRSVPs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWeekView, setIsWeekView] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showOnlyRSVP, setShowOnlyRSVP] = useState(true);
  const [isRSVPing, setIsRSVPing] = useState(false);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  // Check if user can access calendar (Investment Analysts and Analyst Managers only)
  const canAccessCalendar = profile?.role === 'INVESTMENT_ANALYST' || profile?.role === 'ANALYST_MANAGER';

  useEffect(() => {
    fetchData();
  }, [currentMonth, isWeekView, showOnlyRSVP]);  // Added showOnlyRSVP dependency

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events for the current month with buffer
      const monthStart = startOfWeek(startOfMonth(currentMonth));
      const monthEnd = endOfWeek(endOfMonth(currentMonth));

      let eventsQuery = supabase
        .from('events')
        .select(`
          *, 
          user_companies(companyName)
        `)
        .gte('startDate', monthStart.toISOString())
        .lte('startDate', monthEnd.toISOString())
        .order('startDate');

      // If showing only RSVP'd events and user is logged in, filter by RSVP status
      if (showOnlyRSVP && user) {
        eventsQuery = supabase
          .from('events')
          .select(`
            *, 
            user_companies(companyName),
            rsvps!inner(status, userID)
          `)
          .gte('startDate', monthStart.toISOString())
          .lte('startDate', monthEnd.toISOString())
          .eq('rsvps.userID', user.id)
          .eq('rsvps.status', 'ACCEPTED')
          .order('startDate');
      }

      // Fetch subscriptions and RSVPs if user is logged in
      const subscriptionsPromise = user ? supabase
        .from('subscriptions')
        .select('subID, userID, status, gicsSector, gicsSubCategory')
        .eq('userID', user.id)
        .eq('status', 'ACTIVE') : Promise.resolve({ data: [], error: null });

      const rsvpsPromise = user ? supabase
        .from('rsvps')
        .select('eventID, status, rsvpID')
        .eq('userID', user.id) : Promise.resolve({ data: [], error: null });

      // Get companies from GICS database for all companies
      const allCompaniesPromise = supabase
        .from('gics_companies')
        .select('companyID, companyName, tickerSymbol, gicsSector, gicsSubCategory')
        .order('companyName');

      const [eventsResponse, subscriptionsResponse, rsvpsResponse, allCompaniesResponse] = await Promise.all([
        eventsQuery,
        subscriptionsPromise,
        rsvpsPromise,
        allCompaniesPromise
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (subscriptionsResponse.error) throw subscriptionsResponse.error;
      if (rsvpsResponse.error) throw rsvpsResponse.error;
      if (allCompaniesResponse.error) throw allCompaniesResponse.error;
      
      const fetchedEvents = eventsResponse.data || [];
      const userSubscriptions = subscriptionsResponse.data || [];
      const userRSVPsData = rsvpsResponse.data || [];
      const allCompanies = allCompaniesResponse.data || [];
      
      // Filter companies based on view mode
      let filteredCompanies: Company[] = [];
      
      if (showOnlyRSVP) {
        // Show only companies where user has RSVP'd to events
        if (user) {
          const rsvpEventIds = userRSVPsData.map(rsvp => rsvp.eventID);
          const rsvpEvents = fetchedEvents.filter(event => rsvpEventIds.includes(event.eventID));
          
          // Get companies from these RSVP'd events
          const rsvpCompanyIds = rsvpEvents.map(event => event.companyID).filter(Boolean);
          filteredCompanies = allCompanies.filter(company => 
            rsvpCompanyIds.includes(company.companyID)
          );
        }
      } else {
        // Show all companies when "All Events" is selected
        filteredCompanies = allCompanies;
      }
      
      setEvents(fetchedEvents);
      setCompanies(filteredCompanies);
      setSubscriptions(userSubscriptions);
      setUserRSVPs(userRSVPsData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), day));
  };

  const getWeeksInMonth = () => {
    if (isWeekView) {
      const start = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Start week on Monday
      return [{
        start,
        days: Array.from({ length: 5 }, (_, i) => addDays(start, i))
      }];
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const lastWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const weeks = [];
    let currentWeekStart = firstWeekStart;
    
    while (currentWeekStart <= lastWeekEnd) {
      weeks.push({
        start: currentWeekStart,
        days: Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i))
      });
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    return weeks;
  };

  const getEventsForCompanyAndDay = (company: Company, day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startDate), day) && 
      (event.companyID === company.companyID || 
       event.hostCompany?.toLowerCase().includes(company.companyName.toLowerCase()) ||
       company.companyName.toLowerCase().includes(event.hostCompany?.toLowerCase() || ''))
    );
  };

  const getEventTypeColor = (eventType: string) => {
    const colors = {
      'EARNINGS_CALL': 'bg-success/20 text-success border-success/30',
      'INVESTOR_MEETING': 'bg-chart-primary/20 text-chart-primary border-chart-primary/30',
      'CONFERENCE': 'bg-chart-secondary/20 text-chart-secondary border-chart-secondary/30',
      'ROADSHOW': 'bg-chart-tertiary/20 text-chart-tertiary border-chart-tertiary/30',
      'ANALYST_DAY': 'bg-chart-quaternary/20 text-chart-quaternary border-chart-quaternary/30',
      'PRODUCT_LAUNCH': 'bg-gold/20 text-gold border-gold/30',
      'OTHER': 'bg-text-muted/20 text-text-muted border-text-muted/30',
    };
    return colors[eventType as keyof typeof colors] || colors.OTHER;
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const handleRSVP = async (status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
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

      // Refresh data to reflect changes
      fetchData();
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

  const isEventPast = (event: Event) => {
    const eventDate = new Date(event.endDate || event.startDate);
    const now = new Date();
    return eventDate < now;
  };

  // Get RSVP status for a specific event
  const getRSVPStatus = (eventID: string) => {
    const rsvp = userRSVPs.find(r => r.eventID === eventID);
    return rsvp?.status || null;
  };

  // Quick RSVP function for grid usage
  const handleQuickRSVP = async (eventID: string, status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already has an RSVP for this event
      const existingRSVP = userRSVPs.find(r => r.eventID === eventID);

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

        // Update local state
        setUserRSVPs(prev => prev.map(rsvp => 
          rsvp.eventID === eventID ? { ...rsvp, status } : rsvp
        ));
      } else {
        // Create new RSVP
        const { data, error: insertError } = await supabase
          .from('rsvps')
          .insert([{
            eventID: eventID,
            userID: user.id,
            status: status
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Add to local state
        setUserRSVPs(prev => [...prev, data]);
      }

      toast({
        title: "RSVP Updated",
        description: `Set to ${status.toLowerCase()}`,
      });

      // If showing only RSVP events and status is not ACCEPTED, refresh to potentially remove from view
      if (showOnlyRSVP && status !== 'ACCEPTED') {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  if (!canAccessCalendar) {
    return (
      <Layout currentPage="calendar">
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <Card variant="terminal" className="max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gold mb-4">Access Restricted</h2>
              <p className="text-text-secondary">
                Calendar view is only available for Investment Analysts and Analyst Managers.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  

  return (
    <Layout currentPage="calendar">
      <div className="p-2 space-y-2">
        {/* Compact Calendar Header */}
        <div className="flex justify-between items-center bg-surface-primary p-2 border border-border-default">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={isWeekView ? () => setCurrentMonth(subWeeks(currentMonth, 1)) : goToPreviousMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <h1 className="text-sm font-bold text-gold min-w-[120px] text-center">
              {isWeekView 
                ? `Week ${getISOWeek(currentMonth)} - ${format(currentMonth, 'MMM yyyy')}`
                : format(currentMonth, 'MMMM yyyy')
              }
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={isWeekView ? () => setCurrentMonth(addWeeks(currentMonth, 1)) : goToNextMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs text-text-secondary">Month</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsWeekView(!isWeekView)}
              className="p-0 h-5 w-8"
            >
              {isWeekView ? <ToggleRight className="h-4 w-4 text-gold" /> : <ToggleLeft className="h-4 w-4 text-text-secondary" />}
            </Button>
            <span className="text-xs text-text-secondary">Week</span>
          </div>

          {/* View Toggle - RSVP vs All Events */}
          <div className="flex items-center space-x-1 mr-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowOnlyRSVP(!showOnlyRSVP)}
              className={`text-xs h-6 px-2 ${showOnlyRSVP ? 'text-gold bg-gold/10' : 'text-text-secondary hover:bg-surface-secondary'}`}
            >
              {showOnlyRSVP ? '✓ My Events' : 'All Events'}
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gold hover:bg-surface-secondary text-xs h-6 px-2"
              onClick={() => setShowLegend(!showLegend)}
            >
              {showLegend ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              Event Category
            </Button>
            <Button variant="ghost" size="sm" className="text-gold hover:bg-surface-secondary text-xs h-6 px-2">
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-gold hover:bg-surface-secondary text-xs h-6 px-2">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Event Type Legend */}
        {showLegend && (
          <Card variant="terminal" className="mb-2">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'EARNINGS_CALL', label: 'Earnings Call' },
                  { type: 'INVESTOR_MEETING', label: 'Investor Meeting' },
                  { type: 'CONFERENCE', label: 'Conference' },
                  { type: 'ROADSHOW', label: 'Roadshow' },
                  { type: 'ANALYST_DAY', label: 'Analyst Day' },
                  { type: 'PRODUCT_LAUNCH', label: 'Product Launch' },
                  { type: 'OTHER', label: 'Other' }
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-1">
                    <div className={`
                      w-3 h-3 rounded border text-xs
                      ${getEventTypeColor(type)}
                    `}></div>
                    <span className="text-xs text-text-secondary">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Calendar Grid */}
        <Card variant="terminal">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <div className="text-text-secondary text-sm">Loading calendar...</div>
              </div>
            ) : events.length === 0 ? (
              <div className="flex items-center justify-center h-60 flex-col space-y-2">
                <div className="text-text-secondary text-sm">
                  {showOnlyRSVP ? 'No RSVP\'d events for this period' : 'No events for this period'}
                </div>
                {showOnlyRSVP && (
                  <div className="text-text-muted text-xs">
                    Try switching to "All Events" or RSVP to events in the Events tab
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header Row */}
                  <div className="grid border-b border-border-default" style={{ gridTemplateColumns: '120px repeat(auto-fit, minmax(100px, 1fr))' }}>
                    <div className="p-1 font-bold text-gold border-r border-border-default bg-surface-secondary text-xs">
                      Company
                    </div>
                    {getWeeksInMonth().map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-5 border-r border-border-default">
                        <div className="col-span-5 p-1 text-center text-xs font-bold text-gold bg-surface-secondary border-b border-border-default">
                          Week {getISOWeek(week.start)}
                        </div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, dayIndex) => (
                          <div key={day} className="p-1 text-center text-xs font-bold text-gold bg-surface-secondary border-r last:border-r-0 border-border-default">
                            <div>{day}</div>
                            <div className="text-text-muted text-xs">
                              {format(week.days[dayIndex], 'd')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Company Rows */}
                  {companies.map((company) => (
                    <div key={company.companyID} className="grid border-b border-border-default hover:bg-surface-secondary/30" style={{ gridTemplateColumns: '120px repeat(auto-fit, minmax(100px, 1fr))' }}>
                       <div className="p-1 border-r border-border-default font-medium text-text-primary bg-surface-primary">
                         <div className="truncate text-xs pr-1" title={`${company.tickerSymbol} - ${company.companyName}`}>
                           {company.tickerSymbol}
                         </div>
                       </div>
                      
                      {getWeeksInMonth().map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-5 border-r border-border-default">
                          {week.days.map((day, dayIndex) => {
                            const dayEvents = getEventsForCompanyAndDay(company, day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isDayToday = isToday(day);
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`
                                  min-h-[40px] p-0.5 border-r last:border-r-0 border-border-default relative
                                  transition-all duration-200 hover:bg-surface-secondary/50 cursor-pointer
                                  ${!isCurrentMonth ? 'bg-surface-secondary/20' : 'bg-surface-primary'}
                                  ${isDayToday ? 'bg-gold/10' : ''}
                                `}
                                onClick={() => setSelectedDate(day)}
                              >
                                {dayEvents.length > 0 && (
                                   <div className="space-y-0.5">
                                      {dayEvents.slice(0, 2).map((event) => {
                                        const rsvpStatus = getRSVPStatus(event.eventID);
                                        const isEventInPast = isEventPast(event);
                                        return (
                                          <div key={event.eventID} className="group relative">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Badge
                                                  variant="secondary"
                                                  className={`
                                                    text-xs p-0.5 w-full justify-start truncate cursor-pointer hover:opacity-80 transition-opacity relative
                                                    ${getEventTypeColor(event.eventType)}
                                                    ${rsvpStatus === 'ACCEPTED' ? 'ring-1 ring-success' : ''}
                                                    ${rsvpStatus === 'DECLINED' ? 'ring-1 ring-error' : ''}
                                                    ${rsvpStatus === 'TENTATIVE' ? 'ring-1 ring-warning' : ''}
                                                  `}
                                                  title={`${event.eventName} - ${format(new Date(event.startDate), 'h:mm a')}${rsvpStatus ? ` (${rsvpStatus})` : ''}`}
                                                >
                                                  <span className="truncate">
                                                    {event.eventName.length > 6 ? event.eventName.substring(0, 6) + '...' : event.eventName}
                                                  </span>
                                                  {rsvpStatus && (
                                                    <span className="ml-1 text-xs">
                                                      {rsvpStatus === 'ACCEPTED' ? '✓' : rsvpStatus === 'DECLINED' ? '✗' : '?'}
                                                    </span>
                                                  )}
                                                </Badge>
                                              </DropdownMenuTrigger>
                                              {!isEventInPast && (
                                                <DropdownMenuContent 
                                                  align="start" 
                                                  className="bg-surface-primary border border-border-default z-50 min-w-[120px]"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <DropdownMenuItem 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleQuickRSVP(event.eventID, 'ACCEPTED');
                                                    }}
                                                    className="text-success hover:bg-surface-secondary text-xs"
                                                  >
                                                    ✓ Accept
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleQuickRSVP(event.eventID, 'DECLINED');
                                                    }}
                                                    className="text-error hover:bg-surface-secondary text-xs"
                                                  >
                                                    ✗ Decline
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleQuickRSVP(event.eventID, 'TENTATIVE');
                                                    }}
                                                    className="text-warning hover:bg-surface-secondary text-xs"
                                                  >
                                                    ? Tentative
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleEventClick(event);
                                                    }}
                                                    className="text-text-secondary hover:bg-surface-secondary text-xs border-t border-border-default"
                                                  >
                                                    View Details
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              )}
                                            </DropdownMenu>
                                          </div>
                                        );
                                      })}
                                     {dayEvents.length > 2 && (
                                       <div 
                                         className="text-xs text-text-muted text-center cursor-pointer hover:text-gold transition-colors"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setSelectedDate(day);
                                         }}
                                       >
                                         +{dayEvents.length - 2}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        {selectedDate && (
          <Card variant="terminal">
            <CardHeader>
              <CardTitle className="text-gold">
                Events for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {showOnlyRSVP && (
                  <span className="text-sm text-text-muted ml-2">(RSVP'd Events Only)</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getEventsForDay(selectedDate).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getEventsForDay(selectedDate).map((event) => (
                    <Card 
                      key={event.eventID} 
                      className="bg-surface-secondary border-border-default cursor-pointer hover:bg-surface-secondary/80 transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent className="p-4">
                        <div className={`
                          inline-block px-2 py-1 rounded text-xs font-mono mb-2 border
                          ${getEventTypeColor(event.eventType)}
                        `}>
                          {event.eventType.replace('_', ' ')}
                        </div>
                        <h4 className="font-semibold text-text-primary mb-1">{event.eventName}</h4>
                        <p className="text-sm text-text-secondary mb-1">{event.hostCompany}</p>
                        {event.location && (
                          <p className="text-sm text-text-muted mb-1">{event.location}</p>
                        )}
                        <p className="text-sm text-gold font-mono">
                          {format(new Date(event.startDate), 'h:mm a')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-text-secondary py-8">
                  {showOnlyRSVP ? 'No RSVP\'d events for this day' : 'No events scheduled for this day'}
                </div>
              )}
            </CardContent>
          </Card>
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
                  <Badge className={`${getEventTypeColor(selectedEvent.eventType)}`}>
                    {selectedEvent.eventType.replace('_', ' ')}
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
                    <CalendarDays className="mr-3 h-5 w-5 text-gold" />
                    <div>
                      <div className="text-sm font-medium">Date & Time</div>
                      <div>{format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy')}</div>
                      <div className="text-sm">{format(new Date(selectedEvent.startDate), 'h:mm a')}</div>
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
                        <div>{format(new Date(selectedEvent.endDate), 'EEEE, MMMM d, yyyy')}</div>
                        <div className="text-sm">{format(new Date(selectedEvent.endDate), 'h:mm a')}</div>
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

                {/* RSVP Section */}
                <div className="flex gap-2 pt-4 border-t border-border-default">
                  {isEventPast(selectedEvent) ? (
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      disabled
                    >
                      Event Ended
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="default" 
                          className="flex-1"
                          disabled={isRSVPing}
                        >
                          {isRSVPing ? 'Updating...' : 'RSVP'}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="bg-surface-primary border border-border-default z-50">
                        <DropdownMenuItem 
                          onClick={() => handleRSVP('ACCEPTED')}
                          className="text-success hover:bg-surface-secondary"
                        >
                          Accept
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRSVP('DECLINED')}
                          className="text-error hover:bg-surface-secondary"
                        >
                          Decline
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRSVP('TENTATIVE')}
                          className="text-warning hover:bg-surface-secondary"
                        >
                          Tentative
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CalendarPage;