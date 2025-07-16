import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, Filter, CalendarDays, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isToday, addWeeks, subWeeks, getWeek } from 'date-fns';

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  location: string;
  companyID: string;
}

interface Company {
  companyID: string;
  companyName: string;
}

const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [isWeekView, setIsWeekView] = useState(false);
  const { profile } = useAuth();

  // Check if user can access calendar (Investment Analysts and Analyst Managers only)
  const canAccessCalendar = profile?.role === 'INVESTMENT_ANALYST' || profile?.role === 'ANALYST_MANAGER';

  useEffect(() => {
    if (canAccessCalendar) {
      fetchData();
    }
  }, [canAccessCalendar, currentMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events for the current month with buffer
      const monthStart = startOfWeek(startOfMonth(currentMonth));
      const monthEnd = endOfWeek(endOfMonth(currentMonth));

      const [eventsResponse, companiesResponse] = await Promise.all([
        supabase
          .from('events')
          .select('*, user_companies(companyName)')
          .gte('startDate', monthStart.toISOString())
          .lte('startDate', monthEnd.toISOString())
          .order('startDate'),
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
    return events.filter(event => isSameDay(new Date(event.startDate), day));
  };

  const getWeeksInMonth = () => {
    if (isWeekView) {
      const start = startOfWeek(currentMonth);
      return [{
        start,
        days: Array.from({ length: 5 }, (_, i) => addDays(start, i))
      }];
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const firstWeekStart = startOfWeek(monthStart);
    const lastWeekEnd = endOfWeek(monthEnd);
    
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
      event.companyID === company.companyID
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
      <div className="p-8 space-y-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Calendar</h1>
            <p className="text-text-secondary">
              Company events calendar view
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsWeekView(!isWeekView)}
              className="flex items-center gap-2"
            >
              {isWeekView ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {isWeekView ? 'Week View' : 'Month View'}
            </Button>
            <Button variant="terminal">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="ghost">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Navigation Header */}
        <Card variant="terminal">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={isWeekView ? () => setCurrentMonth(subWeeks(currentMonth, 1)) : goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-gold font-mono">
                {isWeekView 
                  ? `Week of ${format(startOfWeek(currentMonth), 'MMM d, yyyy')}`
                  : format(currentMonth, 'MMMM yyyy')
                }
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={isWeekView ? () => setCurrentMonth(addWeeks(currentMonth, 1)) : goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Main Calendar Grid */}
        <Card variant="terminal">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-text-secondary">Loading calendar...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                  {/* Header Row */}
                  <div className="grid border-b border-border-default" style={{ gridTemplateColumns: '200px repeat(auto-fit, minmax(120px, 1fr))' }}>
                    <div className="p-3 font-bold text-gold border-r border-border-default bg-surface-secondary">
                      Company
                    </div>
                    {getWeeksInMonth().map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-5 border-r border-border-default">
                        <div className="col-span-5 p-2 text-center text-xs font-bold text-gold bg-surface-secondary border-b border-border-default">
                          Week {weekIndex + 1}
                        </div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, dayIndex) => (
                          <div key={day} className="p-2 text-center text-xs font-bold text-gold bg-surface-secondary border-r last:border-r-0 border-border-default">
                            <div>{day}</div>
                            <div className="text-text-muted">
                              {format(week.days[dayIndex], 'd')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Company Rows */}
                  {companies.map((company) => (
                    <div key={company.companyID} className="grid border-b border-border-default hover:bg-surface-secondary/30" style={{ gridTemplateColumns: '200px repeat(auto-fit, minmax(120px, 1fr))' }}>
                      <div className="p-3 border-r border-border-default font-medium text-text-primary bg-surface-primary">
                        <div className="truncate" title={company.companyName}>
                          {company.companyName}
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
                                  min-h-[60px] p-1 border-r last:border-r-0 border-border-default relative
                                  transition-all duration-200 hover:bg-surface-secondary/50 cursor-pointer
                                  ${!isCurrentMonth ? 'bg-surface-secondary/20' : 'bg-surface-primary'}
                                  ${isDayToday ? 'bg-gold/10' : ''}
                                `}
                                onClick={() => setSelectedDate(day)}
                              >
                                {dayEvents.length > 0 && (
                                  <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map((event) => (
                                      <Badge
                                        key={event.eventID}
                                        variant="secondary"
                                        className={`
                                          text-xs p-1 w-full justify-start truncate
                                          ${getEventTypeColor(event.eventType)}
                                        `}
                                        title={`${event.eventName} - ${format(new Date(event.startDate), 'h:mm a')}`}
                                      >
                                        {event.eventType.split('_')[0]}
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
                  No events scheduled for this day
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