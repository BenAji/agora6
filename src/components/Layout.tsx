import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Users, Settings, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
}

const Layout = ({ children, currentPage = 'dashboard' }: LayoutProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'companies', label: 'Companies', icon: Building2, path: '/companies' },
    { id: 'users', label: 'Users', icon: Users, path: '/users' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
                    onClick={() => handleNavigation(item.path)}
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
            onClick={handleSignOut}
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