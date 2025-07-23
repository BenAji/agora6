import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  gicsSector: string;
  gicsSubCategory: string;
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
  const [companySortMode, setCompanySortMode] = useState<'events' | 'alpha'>('events');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCompaniesWithEventsOnly, setShowCompaniesWithEventsOnly] = useState(true);
  const [selectedGicsSector, setSelectedGicsSector] = useState<string | null>(null);
  const [selectedGicsSubSector, setSelectedGicsSubSector] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
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
      if (showOnlyRSVP && user && profile) {
        eventsQuery = supabase
          .from('events')
          .select(`
            *, 
            user_companies(companyName),
            rsvps!inner(status, userID)
          `)
          .gte('startDate', monthStart.toISOString())
          .lte('startDate', monthEnd.toISOString())
          .eq('rsvps.userID', profile.id)
          .eq('rsvps.status', 'ACCEPTED')
          .order('startDate');
      }

      // Fetch subscriptions and RSVPs if user is logged in
      const subscriptionsPromise = profile ? supabase
        .from('subscriptions')
        .select('subID, userID, status, gicsSector, gicsSubCategory')
        .eq('userID', profile.id)
        .eq('status', 'ACTIVE') : Promise.resolve({ data: [], error: null });

      const rsvpsPromise = profile ? supabase
        .from('rsvps')
        .select('eventID, status, rsvpID')
        .eq('userID', profile.id) : Promise.resolve({ data: [], error: null });

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
          
          // Get companies from these RSVP'd events by matching host company names
          const rsvpCompanyNames = rsvpEvents.map(event => event.hostCompany).filter(Boolean);
          filteredCompanies = allCompanies.filter(company => {
            if (!company.companyName) return false;
            
            return rsvpCompanyNames.some(hostName => {
              const eventHost = hostName.toLowerCase();
              const companyName = company.companyName.toLowerCase();
              
              // Check if company name is contained in host company or vice versa
              return eventHost.includes(companyName) || companyName.includes(eventHost) ||
                     (company.tickerSymbol && eventHost.includes(company.tickerSymbol.toLowerCase()));
            });
          });
        }
      } else {
        // Show all companies when "All Events" is selected
        filteredCompanies = allCompanies;
      }
      
      setEvents(fetchedEvents);
      setCompanies(filteredCompanies);
      setSubscriptions(userSubscriptions);
      setUserRSVPs(userRSVPsData);

      // Debug logs
      console.log('Fetched events:', fetchedEvents.length);
      console.log('Filtered companies:', filteredCompanies.length);
      console.log('User RSVPs:', userRSVPsData.length);
      console.log('Show only RSVP:', showOnlyRSVP);
      console.log('Sample events:', fetchedEvents.slice(0, 3));
      console.log('Sample companies:', filteredCompanies.slice(0, 3));
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
      const start = startOfWeek(currentMonth, { weekStartsOn: 1 });
      return [{
        start,
        days: Array.from({ length: 7 }, (_, i) => addDays(start, i))
      }];
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    let weeks = [];
    let currentWeekStart = firstWeekStart;

    // Try to fit in 4 weeks if possible
    for (let i = 0; i < 4; i++) {
      weeks.push({
        start: currentWeekStart,
        days: Array.from({ length: 7 }, (_, d) => addDays(currentWeekStart, d))
      });
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    // If the last day of the 4th week covers the month end, return 4 weeks
    const lastDayOfFourthWeek = addDays(firstWeekStart, 27);
    if (lastDayOfFourthWeek >= monthEnd) {
      return weeks;
    }
    // Otherwise, add more weeks as needed
    while (currentWeekStart <= endOfWeek(monthEnd, { weekStartsOn: 1 })) {
      weeks.push({
        start: currentWeekStart,
        days: Array.from({ length: 7 }, (_, d) => addDays(currentWeekStart, d))
      });
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    return weeks;
  };

  const getEventsForCompanyAndDay = (company: Company, day: Date) => {
    const companyEvents = events.filter(event => {
      if (!isSameDay(new Date(event.startDate), day)) return false;

      // Match by companyID if it exists
      if (event.companyID && event.companyID === company.companyID) {
        return true;
      }

      // Match by hostCompany name (case insensitive, exact match)
      if (event.hostCompany && company.companyName) {
        const eventHost = event.hostCompany.toLowerCase();
        const companyName = company.companyName.toLowerCase();
        if (eventHost === companyName) {
          return true;
        }
        // Also check ticker symbol against host company (exact match)
        if (company.tickerSymbol && eventHost === company.tickerSymbol.toLowerCase()) {
          return true;
        }
      }

      // Note: events don't have tickerSymbol field, so we skip this check

      return false;
    });
    return companyEvents;
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
        .eq('userID', profile.id)
        .maybeSingle();

      if (fetchError) {
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
            userID: profile.id,
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
    if (!profile) {
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
            userID: profile.id,
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

  const getCompanyEventCount = (company: Company) => {
    return events.filter(event => {
      // Match by companyID if it exists
      if (event.companyID && event.companyID === company.companyID) return true;
      // Match by hostCompany name (case insensitive, partial match)
      if (event.hostCompany && company.companyName) {
        const eventHost = event.hostCompany.toLowerCase();
        const companyName = company.companyName.toLowerCase();
        if (eventHost.includes(companyName) || companyName.includes(eventHost)) return true;
        if (company.tickerSymbol && eventHost.includes(company.tickerSymbol.toLowerCase())) return true;
      }
      return false;
    }).length;
  };
  const sortedCompanies = [...companies];
  if (companySortMode === 'events') {
    sortedCompanies.sort((a, b) => getCompanyEventCount(b) - getCompanyEventCount(a));
  } else {
    sortedCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName));
  }

  let filteredCompanies = [...sortedCompanies];
  if (showCompaniesWithEventsOnly) {
    filteredCompanies = filteredCompanies.filter(c => getCompanyEventCount(c) > 0);
  }
  if (selectedGicsSector) {
    filteredCompanies = filteredCompanies.filter(c => c.gicsSector === selectedGicsSector);
  }
  if (selectedGicsSubSector) {
    filteredCompanies = filteredCompanies.filter(c => c.gicsSubCategory === selectedGicsSubSector);
  }
  if (selectedCompany) {
    filteredCompanies = filteredCompanies.filter(c => c.companyID === selectedCompany);
  }

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

          <div className="flex items-center space-x-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs h-6 px-2 ${companySortMode === 'events' ? 'text-gold bg-gold/10' : 'text-text-secondary hover:bg-surface-secondary'}`}
              onClick={() => setCompanySortMode(companySortMode === 'events' ? 'alpha' : 'events')}
            >
              {companySortMode === 'events' ? 'Sort: Most Events' : 'Sort: A-Z'}
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
            <Button variant="ghost" size="sm" className="text-gold hover:bg-surface-secondary text-xs h-6 px-2" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </Button>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <span></span>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={showCompaniesWithEventsOnly} onChange={e => setShowCompaniesWithEventsOnly(e.target.checked)} />
                    Hide companies with no events
                  </label>
                </div>
                <div>
                  <label className="block text-xs mb-1">GICS Sector</label>
                  <select className="w-full text-xs p-1 border border-border-default" value={selectedGicsSector || ''} onChange={e => { setSelectedGicsSector(e.target.value || null); setSelectedGicsSubSector(null); setSelectedCompany(null); }}>
                    <option value="">All</option>
                    {[...new Set(companies.map(c => c.gicsSector).filter(Boolean))].sort().map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                {selectedGicsSector && (
                  <div>
                    <label className="block text-xs mb-1">GICS Sub-Sector</label>
                    <select className="w-full text-xs p-1 border border-border-default" value={selectedGicsSubSector || ''} onChange={e => { setSelectedGicsSubSector(e.target.value || null); setSelectedCompany(null); }}>
                      <option value="">All</option>
                      {[...new Set(companies.filter(c => c.gicsSector === selectedGicsSector).map(c => c.gicsSubCategory).filter(Boolean))].sort().map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
                {(selectedGicsSector || selectedGicsSubSector) && (
                  <div>
                    <label className="block text-xs mb-1">Company</label>
                    <select className="w-full text-xs p-1 border border-border-default" value={selectedCompany || ''} onChange={e => setSelectedCompany(e.target.value || null)}>
                      <option value="">All</option>
                      {companies.filter(c => (!selectedGicsSector || c.gicsSector === selectedGicsSector) && (!selectedGicsSubSector || c.gicsSubCategory === selectedGicsSubSector)).sort((a, b) => a.companyName.localeCompare(b.companyName)).map(c => (
                        <option key={c.companyID} value={c.companyID}>{c.companyName}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => { setShowCompaniesWithEventsOnly(false); setSelectedGicsSector(null); setSelectedGicsSubSector(null); setSelectedCompany(null); }}>Reset</Button>
                  <Button size="sm" className="flex-1" variant="outline" onClick={() => setFilterOpen(false)}>Close</Button>
                </div>
              </PopoverContent>
            </Popover>
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
                <div className="min-w-[900px] max-w-full">
                  {/* Header Row */}
                  <div className="grid border-b-2 border-gold/30" style={{ gridTemplateColumns: '100px repeat(auto-fit, minmax(80px, 1fr))' }}>
                    <div className="px-2 py-3 font-bold text-gold border-r-2 border-gold/30 bg-gradient-to-r from-surface-secondary to-surface-secondary/70 text-xs shadow-sm">
                      <div className="text-center">Company</div>
                    </div>
                    {getWeeksInMonth().map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 border-r-2 border-gold/30 bg-gradient-to-b from-surface-secondary to-surface-secondary/70 shadow-sm">
                        <div className="col-span-7 px-1 py-2 text-center text-xs font-bold text-gold border-b border-border-default bg-gradient-to-r from-gold/10 to-gold/5">
                          Week {getISOWeek(week.start)}
                        </div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                          <div key={day} className="px-1 py-1 text-center text-xs font-medium text-gold border-r last:border-r-0 border-border-default/50">
                            <div className="font-semibold">{day}</div>
                            <div className="text-text-muted text-xs leading-tight">
                              {format(week.days[dayIndex], 'd')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Company Rows */}
                  {filteredCompanies.map((company, companyIndex) => (
                    <div key={company.companyID} className={`grid border-b border-border-default/50 hover:bg-surface-secondary/20 transition-colors ${companyIndex % 2 === 0 ? 'bg-surface-primary' : 'bg-surface-primary/50'}`} style={{ gridTemplateColumns: '100px repeat(auto-fit, minmax(80px, 1fr))' }}>
                       <div className="px-2 py-2 border-r-2 border-gold/30 font-medium text-text-primary bg-gradient-to-r from-surface-secondary/30 to-surface-secondary/10 shadow-sm">
                         <div className="text-xs leading-tight font-semibold text-gold" title={`${company.tickerSymbol} - ${company.companyName}`}>
                           {company.tickerSymbol}
                         </div>
                         <div className="text-xs text-text-muted truncate leading-tight" title={company.companyName}>
                           {company.companyName?.length > 12 ? company.companyName.substring(0, 12) + '...' : company.companyName}
                         </div>
                       </div>
                      
                      {getWeeksInMonth().map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 border-r-2 border-gold/30">
                          {week.days.map((day, dayIndex) => {
                            const dayEvents = getEventsForCompanyAndDay(company, day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isDayToday = isToday(day);
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`
                                  min-h-[45px] p-1 border-r last:border-r-0 border-border-default/30 relative
                                  transition-all duration-200 hover:bg-surface-secondary/40 cursor-pointer
                                  ${!isCurrentMonth ? 'bg-surface-secondary/10' : ''}
                                  ${isDayToday ? 'bg-gradient-to-br from-gold/20 to-gold/10 border-gold/50' : ''}
                                `}
                                onClick={() => setSelectedDate(day)}
                              >
                                {dayEvents.length > 0 && (
                                  <div className={`space-y-0.5 ${dayEvents.length > 2 ? 'max-h-[24px] overflow-y-auto' : ''} overflow-x-hidden`}>
                                    {dayEvents.map((event) => {
                                      const rsvpStatus = getRSVPStatus(event.eventID);
                                      return (
                                        <Badge
                                          key={event.eventID}
                                          variant="secondary"
                                          className={`w-full max-w-full truncate whitespace-nowrap cursor-pointer hover:opacity-90 transition-all text-[8px] leading-tight flex items-center gap-1 ${getEventTypeColor(event.eventType)} ${rsvpStatus === 'ACCEPTED' ? 'ring-1 ring-success shadow-sm' : ''} ${rsvpStatus === 'DECLINED' ? 'ring-1 ring-error shadow-sm' : ''} ${rsvpStatus === 'TENTATIVE' ? 'ring-1 ring-warning shadow-sm' : ''} hover:shadow-md hover:scale-[1.02]`}
                                          title={`${event.eventName} – ${format(new Date(event.startDate), 'h:mm a')}${rsvpStatus ? ` (${rsvpStatus})` : ''} – Click for details`}
                                          onClick={e => { e.stopPropagation(); handleEventClick(event); }}
                                        >
                                          <span className="truncate max-w-full whitespace-nowrap">{event.eventName}</span>
                                          <span className="ml-1 text-[8px] text-gold whitespace-nowrap">– {format(new Date(event.startDate), 'h:mm a')}</span>
                                          {rsvpStatus && (
                                            <span className="ml-1 text-[8px] font-bold whitespace-nowrap">{rsvpStatus === 'ACCEPTED' ? '✓' : rsvpStatus === 'DECLINED' ? '✗' : '?'}</span>
                                          )}
                                        </Badge>
                                      );
                                    })}
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
                <div className="flex gap-2 items-center">
                  <Badge className={`${getEventTypeColor(selectedEvent.eventType)}`}>
                    {selectedEvent.eventType.replace('_', ' ')}
                  </Badge>
                  {/* RSVP Status Tag */}
                  {(() => {
                    const rsvpStatus = getRSVPStatus(selectedEvent.eventID);
                    if (rsvpStatus === 'ACCEPTED')
                      return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-success/20 text-success border border-success/30">Accepted</span>;
                    if (rsvpStatus === 'DECLINED')
                      return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-error/20 text-error border border-error/30">Declined</span>;
                    if (rsvpStatus === 'TENTATIVE')
                      return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-warning/20 text-warning border border-warning/30">Tentative</span>;
                    return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-muted/20 text-muted-foreground border border-muted/30">Pending</span>;
                  })()}
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

                {/* Close Button */}
                <DialogFooter className="pt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setEventDetailsOpen(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CalendarPage;