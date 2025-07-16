import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Users, Building2, Clock } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Events',
      value: '124',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      description: 'This month'
    },
    {
      title: 'Active Companies',
      value: '47',
      change: '+5%',
      trend: 'up',
      icon: Building2,
      description: 'Subscribed'
    },
    {
      title: 'Pending RSVPs',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      description: 'Awaiting response'
    },
    {
      title: 'Total Users',
      value: '892',
      change: '+18%',
      trend: 'up',
      icon: Users,
      description: 'Platform users'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
        const trendColor = stat.trend === 'up' ? 'text-success' : 'text-error';
        
        return (
          <Card key={index} variant="terminal" className="group hover:scale-105 transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gold font-mono">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1">
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                  <span className={`text-xs font-medium ${trendColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-text-muted">
                    {stat.description}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;