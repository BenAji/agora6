import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Users, Settings, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
}

const Layout = ({ children, currentPage = 'dashboard' }: LayoutProps) => {
  const { signOut } = useAuth();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'companies', label: 'Companies', icon: Building2, path: '/companies' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-surface-primary border-b border-border-default">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-gold rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gold">AGORA</h1>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link key={item.id} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`text-xs ${
                      isActive 
                        ? 'bg-gold text-black font-semibold' 
                        : 'text-text-secondary hover:text-gold hover:bg-surface-secondary'
                    }`}
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          {/* Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-text-secondary hover:text-error"
            onClick={signOut}
          >
            <LogOut className="mr-1 h-3 w-3" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;