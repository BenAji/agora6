import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import terminalBg from '@/assets/terminal-bg.jpg';
import heroTerminal from '@/assets/hero-terminal.jpg';

const Index: React.FC = () => {
  const navigate = useNavigate();
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
                <Button variant="terminal" onClick={() => navigate('/dashboard')}>
                  View Demo
                </Button>
                <Button onClick={() => navigate('/auth')}>
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
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Start Free Trial
                  </Button>
                  <Button variant="terminal" size="lg" onClick={() => navigate('/events')}>
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
};

export default Index;
