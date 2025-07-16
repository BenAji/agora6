import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Building2 } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    type: string;
    company: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    status: 'upcoming' | 'ongoing' | 'completed';
    rsvpStatus?: 'accepted' | 'declined' | 'tentative' | 'pending';
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-chart-quaternary';
      case 'ongoing': return 'bg-success';
      case 'completed': return 'bg-text-muted';
      default: return 'bg-border-default';
    }
  };

  const getRSVPColor = (rsvp: string) => {
    switch (rsvp) {
      case 'accepted': return 'bg-success';
      case 'declined': return 'bg-error';
      case 'tentative': return 'bg-warning';
      default: return 'bg-border-default';
    }
  };

  return (
    <Card variant="terminal" className="group hover:scale-[1.02] transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-gold group-hover:text-gold-hover transition-colors">
            {event.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor(event.status)} text-black`}>
              {event.status}
            </Badge>
            {event.rsvpStatus && (
              <Badge className={`${getRSVPColor(event.rsvpStatus)} text-black`}>
                {event.rsvpStatus}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-text-secondary font-mono">{event.type}</div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-text-secondary">
            <Building2 className="mr-2 h-4 w-4 text-gold" />
            {event.company}
          </div>
          
          <div className="flex items-center text-sm text-text-secondary">
            <Calendar className="mr-2 h-4 w-4 text-gold" />
            {event.date}
          </div>
          
          <div className="flex items-center text-sm text-text-secondary">
            <Clock className="mr-2 h-4 w-4 text-gold" />
            {event.time}
          </div>
          
          <div className="flex items-center text-sm text-text-secondary">
            <MapPin className="mr-2 h-4 w-4 text-gold" />
            {event.location}
          </div>
          
          <div className="flex items-center text-sm text-text-secondary">
            <Users className="mr-2 h-4 w-4 text-gold" />
            {event.attendees} attendees
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            View Details
          </Button>
          <Button size="sm" variant="default" className="flex-1">
            RSVP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;