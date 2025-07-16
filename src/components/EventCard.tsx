import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
    description?: string;
    startDate?: string;
    endDate?: string;
  };
  onViewDetails?: (event: any) => void;
  onRSVPUpdate?: () => void;
}

const EventCard = ({ event, onViewDetails, onRSVPUpdate }: EventCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRSVPing, setIsRSVPing] = useState(false);
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

  const handleRSVP = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    setIsRSVPing(true);
    try {
      // Check if user already has an RSVP for this event
      const { data: existingRSVP, error: fetchError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('eventID', event.id)
        .eq('userID', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let newStatus: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'PENDING' = 'ACCEPTED';
      
      if (existingRSVP) {
        // Update existing RSVP - cycle through statuses
        const statusCycle: ('ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'PENDING')[] = ['ACCEPTED', 'DECLINED', 'TENTATIVE', 'PENDING'];
        const currentIndex = statusCycle.indexOf(existingRSVP.status);
        newStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        
        const { error: updateError } = await supabase
          .from('rsvps')
          .update({ 
            status: newStatus,
            updatedAt: new Date().toISOString()
          })
          .eq('rsvpID', existingRSVP.rsvpID);

        if (updateError) throw updateError;
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase
          .from('rsvps')
          .insert([{
            eventID: event.id,
            userID: user.id,
            status: newStatus
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "RSVP Updated",
        description: `Your RSVP status has been set to ${newStatus.toLowerCase()}`,
      });

      if (onRSVPUpdate) {
        onRSVPUpdate();
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRSVPing(false);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(event);
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
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            className="flex-1"
            onClick={handleRSVP}
            disabled={isRSVPing}
          >
            {isRSVPing ? 'Updating...' : 'RSVP'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;