import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Download, Filter, CalendarDays, ToggleLeft, ToggleRight, Eye, EyeOff, Clock, MapPin, Building2, ChevronDown, Search, TrendingUp, Users, BarChart3, RefreshCw, Timer, AlertCircle, X, Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';
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
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userRSVPs, setUserRSVPs] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWeekView, setIsWeekView] = useState(true); // Default to week view
  const [showLegend, setShowLegend] = useState(false); // Default hide event category
  const [showOnlyRSVP, setShowOnlyRSVP] = useState(false); // Default to all events
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [companySortMode, setCompanySortMode] = useState<'events' | 'alpha'>('events'); // Default sort by most events
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCompaniesWithEventsOnly, setShowCompaniesWithEventsOnly] = useState(true);
  const [selectedGicsSector, setSelectedGicsSector] = useState<string | null>(null);
  const [selectedGicsSubSector, setSelectedGicsSubSector] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  // Check if user can access calendar (Investment Analysts and Analyst Managers only)
  const canAccessCalendar = profile?.role === 'INVESTMENT_ANALYST' || profile?.role === 'ANALYST_MANAGER';

  useEffect(() => {
    fetchData();
  }, [currentMonth, isWeekView, showOnlyRSVP]);  // Added showOnlyRSVP dependency

  // Load calendar preferences on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('agora-calendar-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        
        // Apply calendar preferences
        setIsWeekView(preferences.defaultView === 'week');
        setShowLegend(preferences.showEventCategory);
        setShowOnlyRSVP(preferences.defaultEventFilter === 'rsvp');
        setCompanySortMode(preferences.defaultSort);
      } catch (error) {
        console.error('Error loading calendar preferences:', error);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 't':
          setSelectedDate(new Date());
          setCurrentMonth(new Date());
          break;
        case 'n':
          if (isWeekView) {
            setCurrentMonth(addWeeks(currentMonth, 1));
          } else {
            setCurrentMonth(addMonths(currentMonth, 1));
          }
          break;
        case 'p':
          if (isWeekView) {
            setCurrentMonth(subWeeks(currentMonth, 1));
          } else {
            setCurrentMonth(subMonths(currentMonth, 1));
          }
          break;
        case 'w':
          setIsWeekView(!isWeekView);
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            fetchData();
            toast({
              title: "Refreshed",
              description: "Calendar data updated",
            });
          }
          break;
        case '/':
          e.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case 'escape':
          setSearchQuery('');
          setSearchResults([]);
          break;
      }
    };

         window.addEventListener('keydown', handleKeyPress);
     return () => window.removeEventListener('keydown', handleKeyPress);
   }, [currentMonth, isWeekView, toast]);

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
    return filteredAndSearchedEvents.filter(event => isSameDay(new Date(event.startDate), day));
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

  const filteredAndSearchedEvents = useMemo(() => {
    let currentEvents = [...events];

    if (showOnlyRSVP) {
      currentEvents = currentEvents.filter(event => getRSVPStatus(event.eventID) === 'ACCEPTED');
    }

    if (selectedGicsSector) {
      currentEvents = currentEvents.filter(event => event.companyID && companies.find(c => c.companyID === event.companyID)?.gicsSector === selectedGicsSector);
    }
    if (selectedGicsSubSector) {
      currentEvents = currentEvents.filter(event => event.companyID && companies.find(c => c.companyID === event.companyID)?.gicsSubCategory === selectedGicsSubSector);
    }
    if (selectedCompany) {
      currentEvents = currentEvents.filter(event => event.companyID === selectedCompany);
    }
    if (searchQuery) {
      currentEvents = currentEvents.filter(event => 
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.hostCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return currentEvents;
  }, [events, showOnlyRSVP, selectedGicsSector, selectedGicsSubSector, selectedCompany, searchQuery, companies]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }
    const results = events.filter(event => 
      event.eventName.toLowerCase().includes(query.toLowerCase()) ||
      event.hostCompany.toLowerCase().includes(query.toLowerCase()) ||
      event.location?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <Layout currentPage="calendar">
      <div className="p-2 space-y-3">


          {/* Search Results Preview */}
          {searchQuery && searchResults.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gold">Search Results</span>
                  <span className="text-xs text-text-muted">{searchResults.length} found</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {searchResults.slice(0, 5).map((event) => (
                    <div 
                      key={event.eventID}
                      className="flex items-center gap-2 p-2 bg-black rounded hover:bg-zinc-800 cursor-pointer"
                      onClick={() => {
                        setSelectedEvent(event);
                        setEventDetailsOpen(true);
                      }}
                    >
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType.replace('_', ' ')}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{event.eventName}</div>
                        <div className="text-xs text-text-muted">{event.hostCompany} • {format(new Date(event.startDate), 'MMM d, h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="text-xs text-text-muted text-center pt-1">
                      +{searchResults.length - 5} more results
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Compact Calendar Header */}
        <div className="flex justify-between items-center bg-black p-2 border border-zinc-800">
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCalendarPopup(true)}
              className="h-6 px-2 text-xs text-gold hover:bg-surface-secondary ml-2"
              title="Open Calendar Assistant"
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              Assistant
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2 flex-1 max-w-md mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-8 h-8 text-sm bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-text-muted hover:text-text-primary"
                >
                  ×
                </Button>
              )}
            </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gold hover:bg-surface-secondary text-xs h-6 px-2">
                  <Filter className="h-3 w-3 mr-1" />
                  Actions
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black border border-zinc-800">
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedDate(new Date());
                    setCurrentMonth(new Date());
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-xs"
                >
                  <CalendarDays className="h-3 w-3" />
                  Go to Today (T)
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    fetchData();
                    toast({
                      title: "Refreshed",
                      description: "Calendar data updated",
                    });
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh Data (Ctrl+R)
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setShowLegend(!showLegend)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-xs"
                >
                  {showLegend ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showLegend ? 'Hide' : 'Show'} Event Categories
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-xs"
                >
                  <Filter className="h-3 w-3" />
                  Advanced Filters
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setCompanySortMode(companySortMode === 'events' ? 'alpha' : 'events')}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-xs"
                >
                  <BarChart3 className="h-3 w-3" />
                  Sort: {companySortMode === 'events' ? 'Switch to A-Z' : 'Switch to Most Events'}
                </DropdownMenuItem>
                
                <Separator className="my-1" />
                
                <DropdownMenuItem 
                  onClick={() => {
                    // Export functionality placeholder
                    toast({
                      title: "Export",
                      description: "Calendar export feature coming soon",
                    });
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-xs"
                >
                  <Download className="h-3 w-3" />
                  Export Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <span></span>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 space-y-3 bg-black border-zinc-800">
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
        <Card variant="terminal" className="bg-black border-zinc-800">
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
                    <div className="px-2 py-3 font-bold text-gold border-r-2 border-gold/30 bg-gradient-to-r from-zinc-900 to-black text-xs shadow-sm">
                      <div className="text-center">Company</div>
                    </div>
                    {getWeeksInMonth().map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 border-r-2 border-gold/30 bg-gradient-to-b from-zinc-900 to-black shadow-sm">
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
                    <div key={company.companyID} className={`grid border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${companyIndex % 2 === 0 ? 'bg-zinc-900' : 'bg-black'}`} style={{ gridTemplateColumns: '100px repeat(auto-fit, minmax(80px, 1fr))' }}>
                       <div className="px-2 py-2 border-r-2 border-gold/30 font-medium text-text-primary bg-gradient-to-r from-zinc-800/50 to-black shadow-sm">
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
                                  min-h-[45px] p-1 border-r last:border-r-0 border-zinc-700/30 relative
                                  transition-all duration-200 hover:bg-zinc-700/60 cursor-pointer group
                                  ${!isCurrentMonth ? 'bg-zinc-800/20' : ''}
                                  ${isDayToday ? 'bg-gradient-to-br from-gold/25 to-gold/15 border-gold/50 shadow-sm' : ''}
                                  ${selectedDate && isSameDay(day, selectedDate) ? 'bg-gold/10 border-gold/30' : ''}
                                  hover:shadow-sm
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
                                          className={`group w-full max-w-full truncate whitespace-nowrap cursor-pointer transition-all duration-200 text-[8px] leading-tight flex items-center gap-1 ${getEventTypeColor(event.eventType)} ${rsvpStatus === 'ACCEPTED' ? 'ring-2 ring-success shadow-md' : ''} ${rsvpStatus === 'DECLINED' ? 'ring-2 ring-error shadow-md' : ''} ${rsvpStatus === 'TENTATIVE' ? 'ring-2 ring-warning shadow-md' : ''} hover:shadow-lg hover:scale-105 hover:z-10 relative transform-gpu`}
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
          <Card variant="terminal" className="bg-black border-zinc-800">
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
                      className="bg-zinc-900 border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors"
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

        {/* Event Details Right-Side Popup */}
        {eventDetailsOpen && selectedEvent && (
          <div 
            className="fixed inset-0 z-50"
            onClick={() => setEventDetailsOpen(false)}
          >
            <div 
              className="absolute right-0 top-16 bottom-0 w-1/3 bg-black border-l-2 border-gold/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-gold/30 bg-gradient-to-r from-zinc-900 to-black">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  <h2 className="text-base font-semibold text-gold truncate">
                    {selectedEvent.eventName}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEventDetailsOpen(false)}
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex flex-col h-full pb-16 overflow-y-auto">
                {/* Event Info */}
                <div className="p-4 border-b border-zinc-700 bg-zinc-900/30">
                  <div className="flex gap-2 items-center mb-3">
                    <Badge className={`${getEventTypeColor(selectedEvent.eventType)} text-xs`}>
                      {selectedEvent.eventType.replace('_', ' ')}
                    </Badge>
                    {/* RSVP Status Tag */}
                    {(() => {
                      const rsvpStatus = getRSVPStatus(selectedEvent.eventID);
                      if (rsvpStatus === 'ACCEPTED')
                        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-success/20 text-success border border-success/30">Accepted</span>;
                      if (rsvpStatus === 'DECLINED')
                        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-error/20 text-error border border-error/30">Declined</span>;
                      if (rsvpStatus === 'TENTATIVE')
                        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-warning/20 text-warning border border-warning/30">Tentative</span>;
                      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted/20 text-muted-foreground border border-muted/30">Pending</span>;
                    })()}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-text-secondary">
                      <Building2 className="mr-2 h-3 w-3 text-gold flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-400">Company</div>
                        <div className="text-xs">{selectedEvent.hostCompany || 'TBD'}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-text-secondary">
                      <CalendarDays className="mr-2 h-3 w-3 text-gold flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-400">Date & Time</div>
                        <div className="text-xs">{format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy')}</div>
                        <div className="text-xs text-gold">{format(new Date(selectedEvent.startDate), 'h:mm a')}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-text-secondary">
                      <MapPin className="mr-2 h-3 w-3 text-gold flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-zinc-400">Location</div>
                        <div className="text-xs">{selectedEvent.location || 'TBD'}</div>
                      </div>
                    </div>

                    {selectedEvent.endDate && (
                      <div className="flex items-center text-text-secondary">
                        <Clock className="mr-2 h-3 w-3 text-gold flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-zinc-400">End Time</div>
                          <div className="text-xs">{format(new Date(selectedEvent.endDate), 'h:mm a')}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-zinc-400 mb-2">Description</div>
                      <div className="text-xs text-text-primary bg-zinc-800/50 p-3 rounded border border-zinc-700">
                        {selectedEvent.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Weather Forecast for Event Date */}
                <div className="p-4 border-b border-zinc-700 bg-zinc-800/20">
                  <div className="text-xs font-medium text-zinc-300 mb-2">Weather Forecast</div>
                  <div className="text-xs text-zinc-400 mb-2">
                    {format(new Date(selectedEvent.startDate), 'EEEE, MMMM d')}
                  </div>
                  {(() => {
                    // Mock weather data for the event date
                    const eventDate = new Date(selectedEvent.startDate);
                    const dayOfYear = Math.floor((eventDate.getTime() - new Date(eventDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
                    const weatherTypes = [
                      { icon: Sun, condition: 'Sunny', temp: '75°F' },
                      { icon: Cloud, condition: 'Partly Cloudy', temp: '68°F' },
                      { icon: CloudRain, condition: 'Light Rain', temp: '62°F' },
                      { icon: Sun, condition: 'Clear', temp: '78°F' },
                      { icon: Cloud, condition: 'Overcast', temp: '65°F' }
                    ];
                    const weather = weatherTypes[dayOfYear % weatherTypes.length];
                    const WeatherIcon = weather.icon;
                    
                    return (
                      <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded border border-zinc-700">
                        <div className="flex items-center gap-2">
                          <WeatherIcon className="h-4 w-4 text-gold" />
                          <div>
                            <div className="text-xs text-zinc-200">{weather.condition}</div>
                            <div className="text-xs text-zinc-400">Perfect for outdoor events</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-white">{weather.temp}</div>
                      </div>
                    );
                  })()}
                </div>

                {/* RSVP Section */}
                <div className="p-4 border-b border-zinc-700 bg-zinc-900/30">
                  <div className="text-xs font-medium text-zinc-300 mb-2">RSVP</div>
                  {isEventPast(selectedEvent) ? (
                    <Button 
                      variant="secondary" 
                      className="w-full text-xs"
                      disabled
                    >
                      Event Ended
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="default" 
                          className="w-full text-xs"
                          disabled={isRSVPing}
                        >
                          {isRSVPing ? 'Updating...' : 'Update RSVP'}
                          <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="bg-black border border-zinc-800 z-50">
                        <DropdownMenuItem 
                          onClick={() => handleRSVP('ACCEPTED')}
                          className="text-success hover:bg-zinc-800 text-xs"
                        >
                          Accept
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRSVP('DECLINED')}
                          className="text-error hover:bg-zinc-800 text-xs"
                        >
                          Decline
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRSVP('TENTATIVE')}
                          className="text-warning hover:bg-zinc-800 text-xs"
                        >
                          Tentative
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Events for Same Date */}
                <div className="p-4 border-b border-zinc-700 flex-1 bg-zinc-800/20">
                  <div className="text-xs font-medium text-zinc-300 mb-2">
                    Other Events on {format(new Date(selectedEvent.startDate), 'MMM d')}
                  </div>
                  {(() => {
                    const sameDay = events.filter(event => 
                      isSameDay(new Date(event.startDate), new Date(selectedEvent.startDate)) &&
                      event.eventID !== selectedEvent.eventID
                    );
                    
                    if (sameDay.length === 0) {
                      return (
                        <div className="text-xs text-zinc-500 italic">
                          No other events on this date
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {sameDay.map((event) => (
                          <div 
                            key={event.eventID}
                            className="p-2 bg-zinc-800/50 rounded border border-zinc-700 hover:border-gold/30 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedEvent(event);
                            }}
                          >
                            <div className="text-xs font-medium text-white mb-1">
                              {event.eventName}
                            </div>
                            <div className="text-xs text-zinc-400 mb-1">
                              {event.hostCompany}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.startDate), 'h:mm a')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Analyst Insights Section */}
                <div className="p-4 border-b border-zinc-700 bg-zinc-900/40">
                  <div className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-gold" />
                    Analyst Insights
                  </div>
                  
                  <div className="space-y-3">
                    {/* Price Performance */}
                    <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                      <div className="text-xs font-medium text-gold mb-2">Price Performance</div>
                      <div className="space-y-1 text-xs">
                        {(() => {
                          // Mock price performance data - replace with real API
                          const company = companies.find(c => 
                            c.companyName?.toLowerCase() === selectedEvent.hostCompany?.toLowerCase() ||
                            c.tickerSymbol?.toLowerCase() === selectedEvent.hostCompany?.toLowerCase()
                          );
                          const ticker = company?.tickerSymbol || 'UNKNOWN';
                          
                          // Generate mock performance based on ticker
                          const mockPerformance = {
                            'AAPL': { change: '+2.3%', trend: 'up', price: '$185.42' },
                            'MSFT': { change: '-1.1%', trend: 'down', price: '$415.67' },
                            'GOOGL': { change: '+0.8%', trend: 'up', price: '$142.89' },
                            'TSLA': { change: '+5.2%', trend: 'up', price: '$245.31' },
                            'AMZN': { change: '-0.5%', trend: 'down', price: '$178.95' },
                            'META': { change: '+1.7%', trend: 'up', price: '$485.12' },
                            'NVDA': { change: '+3.4%', trend: 'up', price: '$892.45' },
                            'NFLX': { change: '-2.1%', trend: 'down', price: '$612.78' }
                          };
                          
                          const performance = mockPerformance[ticker as keyof typeof mockPerformance] || 
                            { change: '+0.5%', trend: 'up', price: '$100.00' };
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Ticker:</span>
                                <span className="text-white font-mono">{ticker}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Current Price:</span>
                                <span className="text-white font-mono">{performance.price}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Today's Change:</span>
                                <span className={`font-mono ${performance.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                  {performance.change}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">30-Day Trend:</span>
                                <span className={`font-mono ${performance.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                  {performance.trend === 'up' ? '+12.5%' : '-8.2%'}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Analyst Coverage */}
                    <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                      <div className="text-xs font-medium text-gold mb-2">Analyst Coverage</div>
                      <div className="space-y-1 text-xs">
                        {(() => {
                          // Mock analyst coverage data
                          const company = companies.find(c => 
                            c.companyName?.toLowerCase() === selectedEvent.hostCompany?.toLowerCase() ||
                            c.tickerSymbol?.toLowerCase() === selectedEvent.hostCompany?.toLowerCase()
                          );
                          const ticker = company?.tickerSymbol || 'UNKNOWN';
                          
                          // Mock coverage data
                          const mockCoverage = {
                            'AAPL': { analysts: 45, buy: 32, hold: 10, sell: 3, avgTarget: '$210.50' },
                            'MSFT': { analysts: 38, buy: 28, hold: 8, sell: 2, avgTarget: '$450.00' },
                            'GOOGL': { analysts: 42, buy: 35, hold: 6, sell: 1, avgTarget: '$165.75' },
                            'TSLA': { analysts: 28, buy: 12, hold: 8, sell: 8, avgTarget: '$275.30' },
                            'AMZN': { analysts: 40, buy: 30, hold: 8, sell: 2, avgTarget: '$195.00' },
                            'META': { analysts: 35, buy: 25, hold: 8, sell: 2, avgTarget: '$520.00' },
                            'NVDA': { analysts: 32, buy: 28, hold: 3, sell: 1, avgTarget: '$950.00' },
                            'NFLX': { analysts: 30, buy: 18, hold: 10, sell: 2, avgTarget: '$650.00' }
                          };
                          
                          const coverage = mockCoverage[ticker as keyof typeof mockCoverage] || 
                            { analysts: 15, buy: 10, hold: 3, sell: 2, avgTarget: '$120.00' };
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Total Analysts:</span>
                                <span className="text-white">{coverage.analysts}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Buy Rating:</span>
                                <span className="text-green-400">{coverage.buy}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Hold Rating:</span>
                                <span className="text-yellow-400">{coverage.hold}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Sell Rating:</span>
                                <span className="text-red-400">{coverage.sell}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Avg Target:</span>
                                <span className="text-white font-mono">{coverage.avgTarget}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Event Type Trends */}
                    <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                      <div className="text-xs font-medium text-gold mb-2">Event Type Trends</div>
                      <div className="space-y-1 text-xs">
                        {(() => {
                          const eventType = selectedEvent.eventType;
                          const currentMonth = new Date(selectedEvent.startDate).getMonth();
                          const currentYear = new Date(selectedEvent.startDate).getFullYear();
                          
                          // Count similar events this month
                          const similarEventsThisMonth = events.filter(e => 
                            e.eventType === eventType &&
                            new Date(e.startDate).getMonth() === currentMonth &&
                            new Date(e.startDate).getFullYear() === currentYear
                          ).length;
                          
                          // Count total events this month
                          const totalEventsThisMonth = events.filter(e => 
                            new Date(e.startDate).getMonth() === currentMonth &&
                            new Date(e.startDate).getFullYear() === currentYear
                          ).length;
                          
                          // Get event type breakdown
                          const eventTypeBreakdown = events.filter(e => 
                            new Date(e.startDate).getMonth() === currentMonth &&
                            new Date(e.startDate).getFullYear() === currentYear
                          ).reduce((acc, e) => {
                            acc[e.eventType] = (acc[e.eventType] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Similar Events:</span>
                                <span className="text-white">{similarEventsThisMonth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Total Events:</span>
                                <span className="text-white">{totalEventsThisMonth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Market Share:</span>
                                <span className="text-white">
                                  {totalEventsThisMonth > 0 ? Math.round((similarEventsThisMonth / totalEventsThisMonth) * 100) : 0}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Top Event Type:</span>
                                <span className="text-white">
                                  {(() => {
                                    const entries = Object.entries(eventTypeBreakdown);
                                    if (entries.length === 0) return 'N/A';
                                    const top = entries.reduce((a, b) => a[1] > b[1] ? a : b);
                                    return `${top[0].replace('_', ' ')} (${top[1]})`;
                                  })()}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="p-4 bg-zinc-900/50">
                  <div className="text-sm font-medium text-zinc-300 mb-3">Calendar</div>
                  {(() => {
                    const eventDate = new Date(selectedEvent.startDate);
                    const monthStart = startOfMonth(eventDate);
                    const monthEnd = endOfMonth(eventDate);
                    const calendarStart = startOfWeek(monthStart);
                    const calendarEnd = endOfWeek(monthEnd);
                    const calendarDays = [];
                    
                    let currentDay = calendarStart;
                    while (currentDay <= calendarEnd) {
                      calendarDays.push(currentDay);
                      currentDay = addDays(currentDay, 1);
                    }

                    return (
                      <div className="space-y-2">
                        {/* Month/Year Header */}
                        <div className="flex items-center justify-between mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent({
                              ...selectedEvent,
                              startDate: subMonths(eventDate, 1).toISOString()
                            })}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <div className="text-sm font-medium text-white">
                            {format(eventDate, 'MMMM yyyy')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent({
                              ...selectedEvent,
                              startDate: addMonths(eventDate, 1).toISOString()
                            })}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-xs text-zinc-500 text-center font-medium">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day, i) => {
                            const dayEvents = events.filter(event => 
                              isSameDay(new Date(event.startDate), day)
                            );
                            const eventCount = dayEvents.length;
                            const isEventDay = isSameDay(day, eventDate);
                            const isCurrentMonth = isSameMonth(day, eventDate);
                            const isCurrentDay = isToday(day);

                            return (
                              <Button
                                key={i}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Navigate to the date on main calendar
                                  setCurrentMonth(day);
                                  setSelectedDate(day);
                                  // Switch to event if available
                                  if (dayEvents.length > 0) {
                                    setSelectedEvent(dayEvents[0]);
                                  }
                                }}
                                className={`h-8 w-8 p-0 text-xs relative ${
                                  isEventDay 
                                    ? 'bg-gold text-black hover:bg-gold/90' 
                                    : isCurrentDay
                                    ? 'bg-gold/20 text-gold hover:bg-gold/30'
                                    : isCurrentMonth
                                    ? 'text-zinc-300 hover:bg-zinc-700'
                                    : 'text-zinc-600 hover:bg-zinc-800'
                                }`}
                              >
                                {format(day, 'd')}
                                {eventCount > 0 && (
                                  <div className={`absolute -top-1 -right-1 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] border border-zinc-700 ${
                                    eventCount >= 5 
                                      ? 'bg-red-500 text-white' 
                                      : eventCount >= 3 
                                      ? 'bg-orange-500 text-white' 
                                      : eventCount >= 2 
                                      ? 'bg-yellow-500 text-black' 
                                      : 'bg-gold text-black'
                                  }`}>
                                    {eventCount > 9 ? '9+' : eventCount}
                                  </div>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 p-2 bg-zinc-900/50 rounded border border-zinc-800">
          <div className="text-xs text-text-muted text-center">
            <span className="font-medium text-gold">Keyboard shortcuts:</span> 
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">T</kbd> Today • 
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">N</kbd> Next • 
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">P</kbd> Previous • 
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">W</kbd> Week view • 
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">/</kbd> Search • 
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">Ctrl+R</kbd> Refresh •
            <kbd className="mx-1 px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">Esc</kbd> Clear search
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;