import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    events: 0,
    companies: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsResult, companiesResult, usersResult] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('gics_companies').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          events: eventsResult.count || 670,
          companies: companiesResult.count || 50,
          users: usersResult.count || 3200
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-yellow-400/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,48,0.3),transparent_50%)]"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-20 p-4 border-b border-yellow-400/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center shadow-lg ring-1 ring-yellow-400/20">
              <span className="text-black font-black text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-yellow-400 tracking-tight">AGORA</h1>
              <p className="text-xs text-gray-400 font-medium">Event Coordination Platform</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs font-medium transition-all duration-200"
              onClick={() => navigate('/calendar')}
            >
              View Demo
            </Button>
            <Button 
              size="sm"
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold text-xs shadow-lg hover:shadow-yellow-400/25 transition-all duration-200"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-8">
          <div className="max-w-7xl mx-auto">
            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-20">
              
              {/* Top Left - Calendar Visual (60%) */}
              <div className="lg:col-span-6 relative">
                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-6 bg-gradient-to-br from-yellow-400/30 via-yellow-400/10 to-transparent rounded-2xl blur-2xl"></div>
                
                {/* Calendar Interface */}
                <div className="relative bg-black/80 backdrop-blur-sm border border-yellow-400/30 rounded-2xl shadow-2xl p-6 w-full ring-1 ring-yellow-400/10">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-700/50 pb-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center shadow-sm">
                        <span className="text-black font-black text-xs">A</span>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm tracking-wide">Calendar View</span>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Week 30 - Jul 2025</div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-gray-400 mb-4">
                      <div>Company</div>
                      <div className="text-center">Mon</div>
                      <div className="text-center">Tue</div>
                      <div className="text-center">Wed</div>
                      <div className="text-center bg-yellow-400/20 rounded-lg p-1 text-yellow-400">Thu</div>
                      <div className="text-center">Fri</div>
                    </div>

                    {/* Company Rows */}
                    {[
                      { name: 'AMZN', event: { day: 0, type: 'earnings' } },
                      { name: 'AAPL', event: { day: 2, type: 'meeting' } },
                      { name: 'MSFT', event: { day: 3, type: 'roadshow' } },
                      { name: 'TSLA', event: { day: 4, type: 'conference' } },
                      { name: 'GOOGL', event: { day: 1, type: 'earnings' } }
                    ].map((company, idx) => (
                      <div key={idx} className="grid grid-cols-6 gap-2 text-xs">
                        <div className="text-white font-semibold py-2">{company.name}</div>
                        {[0, 1, 2, 3, 4].map((day) => (
                          <div key={day} className="h-8 border border-gray-700/50 rounded-lg flex items-center justify-center bg-gray-900/30">
                            {company.event.day === day && (
                              <div className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-medium shadow-sm ${
                                company.event.type === 'earnings' ? 'bg-green-600/90 text-white' :
                                company.event.type === 'roadshow' ? 'bg-red-600/90 text-white' :
                                company.event.type === 'meeting' ? 'bg-blue-600/90 text-white' :
                                'bg-yellow-600/90 text-black'
                              }`}>
                              •
                            </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Legend */}
                  <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-green-600 rounded-full shadow-sm"></div>
                      <span className="text-xs text-gray-400 font-medium">Earnings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-sm"></div>
                      <span className="text-xs text-gray-400 font-medium">Roadshow</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></div>
                      <span className="text-xs text-gray-400 font-medium">Meeting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-yellow-600 rounded-full shadow-sm"></div>
                      <span className="text-xs text-gray-400 font-medium">Conference</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Event Details Popup */}
                <div className="absolute -right-10 top-0 w-52 bg-black/90 backdrop-blur-sm border border-yellow-400/30 rounded-2xl shadow-2xl p-4 transform translate-x-2 h-full ring-1 ring-yellow-400/10">
                  <div className="space-y-3 h-full flex flex-col">
                    {/* Event Header */}
                    <div className="border-b border-gray-700/50 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full shadow-sm"></div>
                          <span className="text-yellow-400 font-bold text-xs tracking-wide">EARNINGS</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Q3 2025</span>
                      </div>
                      <h3 className="text-white font-bold text-sm mb-1">Microsoft Q3 Earnings</h3>
                      <p className="text-gray-400 text-xs font-medium">Microsoft (MSFT)</p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gray-800/80 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-yellow-400 text-xs">📅</span>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Jul 24, 2025</div>
                          <div className="text-gray-400 text-xs">4:00 PM EST</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gray-800/80 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-yellow-400 text-xs">📍</span>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Virtual Event</div>
                          <div className="text-gray-400 text-xs">Webcast</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gray-800/80 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-yellow-400 text-xs">👥</span>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Satya Nadella</div>
                          <div className="text-gray-400 text-xs">CEO</div>
                        </div>
                      </div>
                    </div>

                    {/* RSVP Status */}
                    <div className="border-t border-gray-700/50 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-white text-xs font-semibold">Your RSVP</div>
                          <div className="text-green-400 text-xs font-medium">✓ Confirmed</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs font-medium">Coverage</div>
                          <div className="text-white text-xs font-bold">47 Analysts</div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced RSVP Actions */}
                    <div className="pt-2 space-y-2">
                      <button className="w-full bg-yellow-400 text-black text-xs font-bold py-2 px-3 rounded-lg hover:bg-yellow-500 transition-all duration-200 shadow-sm hover:shadow-yellow-400/25">
                        RSVP
                      </button>
                      <button className="w-full bg-gray-800/80 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Right - Text Content (40%) */}
              <div className="lg:col-span-4 space-y-6 pt-8 px-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                      Analyst-First Platform
                    </h1>
                    <h2 className="text-lg lg:text-xl font-bold text-yellow-400 tracking-wide">
                      Smarter Meeting Coordination
                    </h2>
                  </div>
                  
                  <div className="text-base text-gray-300 font-medium max-w-lg leading-relaxed">
                    High-Velocity Scheduling. Real-Time Intelligence. Built to Scale.
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                    Precision tools for investment analysts. Terminal-inspired UI, real-time visibility, CSV-native workflows. Structure to chaos.
                  </p>
                </div>

                {/* Enhanced Stats Row */}
                <div className="flex items-center space-x-6 pt-2">
                  <div className="text-center">
                    <div className="text-xl font-black text-yellow-400">
                      {loading ? '—' : stats.events.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 font-medium tracking-wide">Events</div>
                  </div>
                  <div className="w-px h-6 bg-gray-600/50"></div>
                  <div className="text-center">
                    <div className="text-xl font-black text-yellow-400">
                      {loading ? '—' : stats.companies.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 font-medium tracking-wide">Companies</div>
                  </div>
                  <div className="w-px h-6 bg-gray-600/50"></div>
                  <div className="text-center">
                    <div className="text-xl font-black text-yellow-400">
                      {loading ? '—' : stats.users.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 font-medium tracking-wide">Users</div>
                  </div>
                </div>

                {/* Buttons at bottom of text area */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    size="lg"
                    className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8 py-3 text-base shadow-lg hover:shadow-yellow-400/25 transition-all duration-200"
                    onClick={() => navigate('/auth?tab=signup')}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold px-8 py-3 text-base transition-all duration-200"
                    onClick={() => navigate('/auth')}
                  >
                    Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
