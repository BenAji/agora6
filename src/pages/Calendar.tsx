import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Download, Filter, CalendarDays, ToggleLeft, ToggleRight, Eye, EyeOff, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isToday, addWeeks, subWeeks, getISOWeek } from 'date-fns';

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  location: string;
  companyID: string;
  gicsSector?: string;
  tickerSymbol?: string;
}

interface Company {
  companyID: string;
  companyName: string;
  tickerSymbol?: string;
}

const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [isWeekView, setIsWeekView] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showOnlyRSVP, setShowOnlyRSVP] = useState(true);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedGicsSectors, setSelectedGicsSectors] = useState<string[]>([]);
  const [sortCompaniesAsc, setSortCompaniesAsc] = useState(true);
  const [selectedCompanyForMonth, setSelectedCompanyForMonth] = useState<string | null>(null);
  const { profile, user } = useAuth();

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

      const [eventsResponse, companiesResponse] = await Promise.all([
        eventsQuery,
        supabase
          .from('user_companies')
          .select('*')
          .order('companyName')
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (companiesResponse.error) throw companiesResponse.error;
      
      setEvents(eventsResponse.data || []);
      setCompanies(companiesResponse.data || []);
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
    return filteredEvents.filter(event => isSameDay(new Date(event.startDate), day));
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

  // Filter helper functions
  const uniqueEventTypes = [...new Set(events.map(event => event.eventType))];
  const uniqueCompanies = [...new Set(events.map(event => event.hostCompany).filter(Boolean))];
  const uniqueGicsSectors = [...new Set(events.map(event => event.gicsSector).filter(Boolean))];

  const getFilteredEvents = () => {
    return events.filter(event => {
      if (selectedEventTypes.length > 0 && !selectedEventTypes.includes(event.eventType)) return false;
      if (selectedCompanies.length > 0 && !selectedCompanies.includes(event.hostCompany)) return false;
      if (selectedGicsSectors.length > 0 && !selectedGicsSectors.includes(event.gicsSector || '')) return false;
      if (selectedCompanyForMonth && event.hostCompany !== selectedCompanyForMonth) return false;
      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  const getSortedCompanies = () => {
    const sorted = [...companies].sort((a, b) => {
      const comparison = a.companyName.localeCompare(b.companyName);
      return sortCompaniesAsc ? comparison : -comparison;
    });
    return sorted;
  };

  const clearAllFilters = () => {
    setSelectedEventTypes([]);
    setSelectedCompanies([]);
    setSelectedGicsSectors([]);
    setSelectedCompanyForMonth(null);
  };

  const activeFiltersCount = selectedEventTypes.length + selectedCompanies.length + selectedGicsSectors.length + (selectedCompanyForMonth ? 1 : 0);

  const handleCompanyClick = (companyName: string) => {
    setSelectedCompanyForMonth(selectedCompanyForMonth === companyName ? null : companyName);
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gold hover:bg-surface-secondary text-xs h-6 px-2 relative">
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-gold text-gold-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-popover border-border-default" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-popover-foreground">Filter Events</h4>
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  {/* Event Types Filter */}
                  <div>
                    <label className="text-sm font-medium text-popover-foreground mb-2 block">Event Types</label>
                    <div className="space-y-2">
                      {uniqueEventTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`eventType-${type}`}
                            checked={selectedEventTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEventTypes([...selectedEventTypes, type]);
                              } else {
                                setSelectedEventTypes(selectedEventTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <label htmlFor={`eventType-${type}`} className="text-sm text-popover-foreground cursor-pointer">
                            {type.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Companies Filter */}
                  <div>
                    <label className="text-sm font-medium text-popover-foreground mb-2 block">Companies</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
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
                          <label htmlFor={`company-${company}`} className="text-sm text-popover-foreground cursor-pointer">
                            {company}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GICS Sectors Filter */}
                  <div>
                    <label className="text-sm font-medium text-popover-foreground mb-2 block">GICS Sectors</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
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
                          <label htmlFor={`gics-${sector}`} className="text-sm text-popover-foreground cursor-pointer">
                            {sector}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
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
                <div className="min-w-[800px]">
                  {/* Header Row */}
                  <div className="grid border-b border-border-default" style={{ gridTemplateColumns: '120px repeat(auto-fit, minmax(100px, 1fr))' }}>
                    <div className="p-1 font-bold text-gold border-r border-border-default bg-surface-secondary text-xs flex items-center justify-between cursor-pointer hover:bg-surface-secondary/80" onClick={() => setSortCompaniesAsc(!sortCompaniesAsc)}>
                      <span>Company</span>
                      <ArrowUpDown className="h-3 w-3" />
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
                  {getSortedCompanies().map((company) => (
                    <div key={company.companyID} className={`grid border-b border-border-default hover:bg-surface-secondary/30 ${selectedCompanyForMonth === company.companyName ? 'bg-gold/10' : ''}`} style={{ gridTemplateColumns: '120px repeat(auto-fit, minmax(100px, 1fr))' }}>
                      <div className="p-1 border-r border-border-default font-medium text-text-primary bg-surface-primary cursor-pointer hover:bg-surface-secondary/50" onClick={() => handleCompanyClick(company.companyName)}>
                        <div className="truncate text-xs pr-1" title={`${company.companyName}${company.tickerSymbol ? ` (${company.tickerSymbol})` : ''}`}>
                          <div>{company.companyName}</div>
                          {company.tickerSymbol && (
                            <div className="text-xs text-text-muted font-mono">{company.tickerSymbol}</div>
                          )}
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
                                     {dayEvents.slice(0, 2).map((event) => (
                                       <Badge
                                         key={event.eventID}
                                         variant="secondary"
                                         className={`
                                           text-xs p-0.5 w-full justify-start truncate
                                           ${getEventTypeColor(event.eventType)}
                                         `}
                                         title={`${event.eventName} - ${format(new Date(event.startDate), 'h:mm a')}${showOnlyRSVP ? ' (RSVP\'d)' : ''}`}
                                       >
                                         {event.eventName.length > 8 ? event.eventName.substring(0, 8) + '...' : event.eventName}
                                       </Badge>
                                     ))}
                                     {dayEvents.length > 2 && (
                                       <div className="text-xs text-text-muted text-center">
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
                    <Card key={event.eventID} className="bg-surface-secondary border-border-default">
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
      </div>
    </Layout>
  );
};

export default CalendarPage;