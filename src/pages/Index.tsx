import { useState } from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';
import DashboardStats from '@/components/DashboardStats';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import terminalBg from '@/assets/terminal-bg.jpg';
import heroTerminal from '@/assets/hero-terminal.jpg';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'events'>('landing');

  // Mock event data
  const mockEvents = [
    {
      id: '1',
      title: 'Q3 Earnings Call',
      type: 'Earnings Call',
      company: 'Apple Inc.',
      date: 'Dec 18, 2024',
      time: '09:00 EST',
      location: 'Virtual Event',
      attendees: 245,
      status: 'upcoming' as const,
      rsvpStatus: 'accepted' as const,
    },
    {
      id: '2',
      title: 'Annual Investor Day',
      type: 'Investor Meeting',
      company: 'Microsoft Corp.',
      date: 'Dec 20, 2024',
      time: '14:00 EST',
      location: 'Redmond Campus',
      attendees: 180,
      status: 'upcoming' as const,
      rsvpStatus: 'pending' as const,
    },
    {
      id: '3',
      title: 'Product Launch Event',
      type: 'Product Launch',
      company: 'Tesla Inc.',
      date: 'Dec 22, 2024',
      time: '18:00 PST',
      location: 'Austin Gigafactory',
      attendees: 320,
      status: 'upcoming' as const,
      rsvpStatus: 'tentative' as const,
    },
  ];

  if (!isAuthenticated && currentView === 'landing') {
    return (
      <div 
        className="min-h-screen bg-background relative"
        style={{
          backgroundImage: `url(${terminalBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="p-6 border-b border-border-default bg-surface-primary/90 backdrop-blur">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-gold rounded-sm flex items-center justify-center">
                  <span className="text-black font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gold">AGORA</h1>
                  <p className="text-xs text-text-secondary">Event Coordination Platform</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="terminal" onClick={() => setCurrentView('dashboard')}>
                  View Demo
                </Button>
                <Button onClick={() => setIsAuthenticated(true)}>
                  Get Started
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="flex-1 flex items-center">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-gold leading-tight">
                    Bloomberg-Style
                    <br />
                    <span className="text-text-primary">IR Platform</span>
                  </h1>
                  <p className="text-xl text-text-secondary leading-relaxed">
                    Professional event coordination for Investor Relations teams and analysts. 
                    Featuring terminal-inspired design, real-time analytics, and enterprise-grade functionality.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-surface-secondary border border-border-default rounded-sm">
                    <div className="text-2xl font-bold text-gold font-mono">124</div>
                    <div className="text-sm text-text-secondary">Events</div>
                  </div>
                  <div className="p-4 bg-surface-secondary border border-border-default rounded-sm">
                    <div className="text-2xl font-bold text-success font-mono">47</div>
                    <div className="text-sm text-text-secondary">Companies</div>
                  </div>
                  <div className="p-4 bg-surface-secondary border border-border-default rounded-sm">
                    <div className="text-2xl font-bold text-chart-quaternary font-mono">892</div>
                    <div className="text-sm text-text-secondary">Users</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button size="lg" onClick={() => setIsAuthenticated(true)}>
                    Start Free Trial
                  </Button>
                  <Button variant="terminal" size="lg" onClick={() => setCurrentView('events')}>
                    View Events
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroTerminal} 
                  alt="Bloomberg Terminal Interface" 
                  className="w-full rounded-sm border border-border-default shadow-terminal"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (isAuthenticated && currentView === 'landing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthForm mode={authMode} onModeChange={setAuthMode} />
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <Layout currentPage="dashboard">
        <div className="p-8 space-y-8">
          {/* Dashboard Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gold mb-2">Dashboard</h1>
              <p className="text-text-secondary">
                Real-time insights and analytics for your IR events
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="terminal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendar View
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </div>
          </div>

          {/* Stats */}
          <DashboardStats />

          {/* Recent Events */}
          <Card variant="terminal">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gold">Recent Events</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('events')}>
                  View All Events
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (currentView === 'events') {
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
            <Button onClick={() => setCurrentView('dashboard')}>
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
                  />
                </div>
                <Button variant="terminal">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default Index;
