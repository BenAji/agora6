import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Download, Filter, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isToday } from 'date-fns';

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  location: string;
}

interface Company {
  companyID: string;
  companyName: string;
}

const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
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

      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*, user_companies(companyName)')
        .gte('startDate', monthStart.toISOString())
        .lte('startDate', monthEnd.toISOString())
        .order('startDate');

      if (error) throw error;
      setEvents(eventsData || []);
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

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    let day = start;

    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
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

  const calendarDays = getCalendarDays();

  return (
    <Layout currentPage="calendar">
      <div className="p-8 space-y-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Calendar</h1>
            <p className="text-text-secondary">
              Professional monthly event calendar
            </p>
          </div>
          <div className="flex gap-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <div className="space-y-6">
            {/* Month Navigation */}
            <Card variant="terminal">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-gold font-mono">
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="p-0"
                  classNames={{
                    months: "flex flex-col space-y-0",
                    month: "space-y-0",
                    caption: "hidden",
                    table: "w-full border-collapse",
                    head_row: "flex",
                    head_cell: "text-gold text-xs font-mono w-8 h-8 flex items-center justify-center",
                    row: "flex w-full",
                    cell: "h-8 w-8 text-center text-xs relative p-0 [&:has([aria-selected])]:bg-gold/20",
                    day: "h-8 w-8 p-0 font-normal hover:bg-surface-secondary",
                    day_selected: "bg-gold text-black font-bold",
                    day_today: "bg-gold/20 text-gold font-bold",
                    day_outside: "text-text-muted opacity-50",
                  }}
                />
              </CardContent>
            </Card>

            {/* Event Types Legend */}
            <Card variant="terminal">
              <CardHeader>
                <CardTitle className="text-gold text-sm">Event Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: 'EARNINGS_CALL', label: 'Earnings Call' },
                  { type: 'INVESTOR_MEETING', label: 'Investor Meeting' },
                  { type: 'CONFERENCE', label: 'Conference' },
                  { type: 'ROADSHOW', label: 'Roadshow' },
                  { type: 'ANALYST_DAY', label: 'Analyst Day' },
                  { type: 'PRODUCT_LAUNCH', label: 'Product Launch' },
                  { type: 'OTHER', label: 'Other' }
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded border ${getEventTypeColor(type)}`}></div>
                    <span className="text-xs text-text-secondary">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Calendar Grid */}
          <div className="lg:col-span-3">
            <Card variant="terminal">
              <CardHeader>
                <CardTitle className="text-gold flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-text-secondary">Loading calendar...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="p-2 text-center text-gold font-mono text-sm font-bold">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {calendarDays.map((day) => {
                      const dayEvents = getEventsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isDayToday = isToday(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);

                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            min-h-[120px] p-2 border border-border-default
                            cursor-pointer transition-all duration-200 hover:bg-surface-secondary/50
                            ${!isCurrentMonth ? 'bg-surface-secondary/20 text-text-muted' : 'bg-surface-primary'}
                            ${isDayToday ? 'ring-2 ring-gold ring-inset' : ''}
                            ${isSelected ? 'bg-gold/10 border-gold' : ''}
                          `}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`
                            text-sm font-mono mb-1
                            ${isDayToday ? 'text-gold font-bold' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'}
                          `}>
                            {format(day, 'd')}
                          </div>
                          
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.eventID}
                                className={`
                                  text-xs p-1 rounded border cursor-pointer
                                  transition-all duration-200 hover:scale-105
                                  ${getEventTypeColor(event.eventType)}
                                `}
                                title={`${event.eventName}\n${event.hostCompany || ''}\n${event.location || ''}\n${format(new Date(event.startDate), 'h:mm a')}`}
                              >
                                <div className="font-semibold truncate">
                                  {event.eventName}
                                </div>
                                <div className="truncate opacity-80">
                                  {event.hostCompany}
                                </div>
                              </div>
                            ))}
                            
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-text-muted p-1">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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