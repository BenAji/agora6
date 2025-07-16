import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';

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

const Calendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  // Check if user can access calendar (Investment Analysts and Analyst Managers only)
  const canAccessCalendar = profile?.role === 'INVESTMENT_ANALYST' || profile?.role === 'ANALYST_MANAGER';

  useEffect(() => {
    if (canAccessCalendar) {
      fetchData();
    }
  }, [canAccessCalendar, currentWeek]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events for the current month
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const monthStart = addDays(weekStart, -7); // Extra week for buffer
      const monthEnd = addDays(weekStart, 35); // 5 weeks

      const [eventsData, companiesData] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .gte('startDate', monthStart.toISOString())
          .lte('startDate', monthEnd.toISOString())
          .order('startDate'),
        supabase
          .from('user_companies')
          .select('companyID, companyName')
          .order('companyName')
      ]);

      if (eventsData.error) throw eventsData.error;
      if (companiesData.error) throw companiesData.error;

      setEvents(eventsData.data || []);
      setCompanies(companiesData.data || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  };

  const getEventsForCompanyAndDay = (company: Company, day: Date) => {
    return events.filter(event => 
      event.hostCompany === company.companyName && 
      isSameDay(new Date(event.startDate), day)
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

  const weekDays = getWeekDays();

  return (
    <Layout currentPage="calendar">
      <div className="p-8 space-y-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Calendar</h1>
            <p className="text-text-secondary">
              Company-based event calendar view
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

        {/* Week Navigation */}
        <Card variant="terminal">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gold">
                  {format(weekDays[0], 'MMM d')} - {format(weekDays[4], 'MMM d, yyyy')}
                </h2>
              </div>
              
              <Button variant="ghost" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card variant="terminal">
          <CardHeader>
            <CardTitle className="text-gold">Weekly View</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-text-secondary">Loading calendar...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-default">
                      <th className="text-left p-4 w-48 text-gold font-mono">Company</th>
                      {weekDays.map((day) => (
                        <th key={day.toISOString()} className="text-center p-4 min-w-[200px]">
                          <div className="text-gold font-mono">
                            {format(day, 'EEE')}
                          </div>
                          <div className="text-text-secondary text-sm">
                            {format(day, 'MMM d')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.companyID} className="border-b border-border-default hover:bg-surface-secondary/50">
                        <td className="p-4 border-r border-border-default">
                          <div className="font-semibold text-text-primary truncate">
                            {company.companyName}
                          </div>
                        </td>
                        {weekDays.map((day) => {
                          const dayEvents = getEventsForCompanyAndDay(company, day);
                          return (
                            <td key={`${company.companyID}-${day.toISOString()}`} className="p-2 align-top">
                              <div className="space-y-1">
                                {dayEvents.map((event) => (
                                  <div
                                    key={event.eventID}
                                    className={`
                                      p-2 rounded text-xs border cursor-pointer
                                      transition-all duration-200 hover:scale-105
                                      ${getEventTypeColor(event.eventType)}
                                    `}
                                    title={`${event.eventName}\n${event.location}\n${format(new Date(event.startDate), 'h:mm a')}`}
                                  >
                                    <div className="font-semibold truncate">
                                      {event.eventName}
                                    </div>
                                    <div className="text-xs opacity-80">
                                      {format(new Date(event.startDate), 'h:mm a')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {companies.length === 0 && (
                  <div className="p-8 text-center text-text-secondary">
                    No companies found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card variant="terminal">
          <CardHeader>
            <CardTitle className="text-gold text-sm">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {[
                'EARNINGS_CALL',
                'INVESTOR_MEETING', 
                'CONFERENCE',
                'ROADSHOW',
                'ANALYST_DAY',
                'PRODUCT_LAUNCH',
                'OTHER'
              ].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded border ${getEventTypeColor(type)}`}></div>
                  <span className="text-xs text-text-secondary font-mono">
                    {type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calendar;