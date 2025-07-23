import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: 'email' | 'sms' | 'desktop' | 'mobile';
  enabled: boolean;
  frequency_days: number;
  gics_sectors?: string[];
  companies?: string[];
}

interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  hostCompany: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  companyID?: string;
}

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const generateEmailTemplate = (events: Event[], userName: string, daysBefore: number) => {
  const eventListHtml = events.map(event => `
    <div style="border: 1px solid #333; margin: 10px 0; padding: 15px; background-color: #1a1a1a; border-radius: 4px;">
      <h3 style="color: #FFD700; margin: 0 0 10px 0;">${event.eventName}</h3>
      <p style="color: #cccccc; margin: 5px 0;"><strong>Company:</strong> ${event.hostCompany}</p>
      <p style="color: #cccccc; margin: 5px 0;"><strong>Type:</strong> ${event.eventType.replace(/_/g, ' ')}</p>
      <p style="color: #cccccc; margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()} at ${new Date(event.startDate).toLocaleTimeString()}</p>
      <p style="color: #cccccc; margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
      ${event.description ? `<p style="color: #cccccc; margin: 10px 0 0 0;">${event.description}</p>` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Upcoming Events - AGORA</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FFD700; margin-bottom: 5px;">AGORA</h1>
          <p style="color: #cccccc; margin: 0;">Bloomberg-Style IR Platform</p>
        </div>
        
        <h2 style="color: #FFD700;">Hello ${userName},</h2>
        <p style="color: #cccccc; line-height: 1.6;">
          You have ${events.length} upcoming ${events.length === 1 ? 'event' : 'events'} 
          in the next ${daysBefore} ${daysBefore === 1 ? 'day' : 'days'} based on your notification preferences:
        </p>
        
        ${eventListHtml}
        
        <div style="margin-top: 30px; padding: 20px; background-color: #2d2d2d; border-radius: 4px;">
          <p style="color: #cccccc; margin: 0; font-size: 14px;">
            You're receiving this notification because you've subscribed to receive updates about upcoming events.
            You can manage your notification preferences in your AGORA account settings.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #888888; font-size: 12px;">
            © 2024 AGORA - Bloomberg-Style IR Platform
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateSMSMessage = (events: Event[], userName: string, daysBefore: number) => {
  const eventsList = events.map(event => 
    `• ${event.eventName} - ${event.hostCompany} (${new Date(event.startDate).toLocaleDateString()})`
  ).join('\n');

  return `AGORA Alert: Hi ${userName}, you have ${events.length} upcoming event${events.length > 1 ? 's' : ''} in ${daysBefore} day${daysBefore > 1 ? 's' : ''}:\n\n${eventsList}\n\nCheck your AGORA dashboard for details.`;
};

const getUpcomingEvents = async (daysAhead: number): Promise<Event[]> => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('startDate', startDate.toISOString())
    .lte('startDate', endDate.toISOString())
    .order('startDate');

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data || [];
};

const getUsersWithProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }

  return data || [];
};

const getNotificationPreferences = async (): Promise<NotificationPreference[]> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('enabled', true);

  if (error) {
    console.error('Error fetching notification preferences:', error);
    return [];
  }

  return data || [];
};

const filterEventsForUser = (events: Event[], preferences: NotificationPreference): Event[] => {
  return events.filter(event => {
    // Check if user wants notifications for this company
    if (preferences.companies && preferences.companies.length > 0) {
      if (event.companyID && preferences.companies.includes(event.companyID)) {
        return true;
      }
    }

    // Check GICS sectors
    if (preferences.gics_sectors && preferences.gics_sectors.length > 0) {
      // For now, include all events if GICS sectors are specified
      // In a real implementation, you'd need to map events to GICS sectors
      return true;
    }

    // If no specific preferences, include all events
    if ((!preferences.companies || preferences.companies.length === 0) && 
        (!preferences.gics_sectors || preferences.gics_sectors.length === 0)) {
      return true;
    }

    return false;
  });
};

const sendNotification = async (
  userId: string,
  notificationType: string,
  eventId: string,
  subject: string,
  message: string,
  htmlContent?: string,
  email?: string,
  phoneNumber?: string
) => {
  try {
    const response = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        notificationType,
        eventId,
        subject,
        message,
        htmlContent,
        email,
        phoneNumber,
      },
    });

    if (response.error) {
      console.error('Error sending notification:', response.error);
      return false;
    }

    return response.data?.success || false;
  } catch (error) {
    console.error('Failed to call send-notification function:', error);
    return false;
  }
};

const processEventNotifications = async (): Promise<void> => {
  console.log('🔔 Starting event notification process...');

  try {
    const [users, preferences] = await Promise.all([
      getUsersWithProfiles(),
      getNotificationPreferences(),
    ]);

    console.log(`📊 Found ${users.length} users and ${preferences.length} notification preferences`);

    // Group preferences by user
    const userPreferences = preferences.reduce((acc, pref) => {
      if (!acc[pref.user_id]) {
        acc[pref.user_id] = [];
      }
      acc[pref.user_id].push(pref);
      return acc;
    }, {} as Record<string, NotificationPreference[]>);

    for (const user of users) {
      const userPrefs = userPreferences[user.id];
      if (!userPrefs || userPrefs.length === 0) {
        console.log(`⏭️ Skipping user ${user.id} - no notification preferences`);
        continue;
      }

      // Process each enabled notification type
      for (const pref of userPrefs) {
        const events = await getUpcomingEvents(pref.frequency_days);
        const relevantEvents = filterEventsForUser(events, pref);

        if (relevantEvents.length === 0) {
          console.log(`📭 No relevant events for user ${user.id} (${pref.notification_type})`);
          continue;
        }

        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
        const subject = `AGORA: ${relevantEvents.length} Upcoming Event${relevantEvents.length > 1 ? 's' : ''} in ${pref.frequency_days} Day${pref.frequency_days > 1 ? 's' : ''}`;

        // Send notification based on type
        if (pref.notification_type === 'email') {
          const htmlContent = generateEmailTemplate(relevantEvents, userName, pref.frequency_days);
          await sendNotification(
            user.id,
            'email',
            relevantEvents[0].eventID,
            subject,
            'Check your email for event details',
            htmlContent,
            user.user_id // This would need to be the actual email in production
          );
        } else if (pref.notification_type === 'sms') {
          const smsMessage = generateSMSMessage(relevantEvents, userName, pref.frequency_days);
          await sendNotification(
            user.id,
            'sms',
            relevantEvents[0].eventID,
            subject,
            smsMessage,
            undefined,
            undefined,
            user.user_id // This would need to be the actual phone number in production
          );
        } else if (pref.notification_type === 'desktop') {
          await sendNotification(
            user.id,
            'desktop',
            relevantEvents[0].eventID,
            subject,
            `You have ${relevantEvents.length} upcoming events`
          );
        } else if (pref.notification_type === 'mobile') {
          await sendNotification(
            user.id,
            'mobile',
            relevantEvents[0].eventID,
            subject,
            `You have ${relevantEvents.length} upcoming events`
          );
        }

        console.log(`✅ Sent ${pref.notification_type} notification to ${userName} for ${relevantEvents.length} events`);
      }
    }

    console.log('🎉 Event notification process completed successfully');
  } catch (error) {
    console.error('❌ Error in notification process:', error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing event notifications...');
    await processEventNotifications();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications processed successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing notifications:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);