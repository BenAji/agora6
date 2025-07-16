import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Users, Settings, BarChart3, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
}

const Layout = ({ children, currentPage = 'dashboard' }: LayoutProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Bloomberg-style Sidebar */}
      <aside className="w-64 bg-surface-primary border-r border-border-default">
        <div className="p-6 border-b border-border-default">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-gold rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gold">AGORA</h1>
              <p className="text-xs text-text-secondary">Event Coordination</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start text-left ${
                      isActive 
                        ? 'bg-gold text-black font-semibold' 
                        : 'text-text-secondary hover:text-gold hover:bg-surface-secondary'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-text-secondary hover:text-error"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;