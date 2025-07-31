import { supabase } from '@/integrations/supabase/client';
import { 
  sendEmailNotification, 
  sendSMSNotification, 
  sendDesktopNotification, 
  sendMobileNotification,
  sendEmailViaSupabase,
  logNotificationToDatabase,
  getUserEmail,
  getUserPhone
} from './notificationServices';

interface NotificationPreference {
  id?: string;
  user_id: string;
  notification_type: 'email' | 'sms' | 'desktop' | 'mobile';
  enabled: boolean;
  frequency_days: number;
  gics_sectors?: string[];
  companies?: string[];
  created_at?: string;
  updated_at?: string;
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

// Generate HTML email template
const generateEmailTemplate = (events: Event[], userName: string, daysBefore: number) => {
  const eventListHtml = events.map(event => `
    <div style="border: 1px solid #333; margin: 10px 0; padding: 15px; background-color: #1a1a1a; border-radius: 4px;">
              <h3 style="color: #B8860B; margin: 0 0 10px 0;">${event.eventName}</h3>
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
          <h1 style="color: #B8860B; margin-bottom: 5px;">AGORA</h1>
          <p style="color: #cccccc; margin: 0;">Bloomberg-Style IR Platform</p>
        </div>
        
        <h2 style="color: #B8860B;">Hello ${userName},</h2>
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

// Generate SMS message
const generateSMSMessage = (events: Event[], userName: string, daysBefore: number) => {
  const eventsList = events.map(event => 
    `• ${event.eventName} - ${event.hostCompany} (${new Date(event.startDate).toLocaleDateString()})`
  ).join('\n');

  return `AGORA Alert: Hi ${userName}, you have ${events.length} upcoming event${events.length > 1 ? 's' : ''} in ${daysBefore} day${daysBefore > 1 ? 's' : ''}:\n\n${eventsList}\n\nCheck your AGORA dashboard for details.`;
};

// Get events happening in the next N days
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

// Get all users with their profiles and notification preferences
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

// Get user's notification preferences from database
const getUserNotificationPreferences = async (userId: string): Promise<NotificationPreference[]> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true);

  if (error) {
    console.error('Error fetching notification preferences:', error);
    return [];
  }

  // Cast the data to the correct type
  return (data || []).map(pref => ({
    ...pref,
    notification_type: pref.notification_type as 'email' | 'sms' | 'desktop' | 'mobile'
  }));
};

// Filter events based on user's notification preferences
const filterEventsForUser = (events: Event[], preferences: NotificationPreference): Event[] => {
  return events.filter(event => {
    // Check if user wants notifications for this company
    if (preferences.companies && preferences.companies.length > 0) {
      if (event.companyID && preferences.companies.includes(event.companyID)) {
        return true;
      }
    }

    // Check GICS sectors (this would require additional logic to map events to GICS)
    // For now, we'll include all events if GICS sectors are specified
    if (preferences.gics_sectors && preferences.gics_sectors.length > 0) {
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

// Main function to process and send notifications
export const processEventNotifications = async (): Promise<void> => {
  console.log('🔔 Starting event notification process...');

  try {
    // Get all users
    const users = await getUsersWithProfiles();
    console.log(`📊 Found ${users.length} users to process`);

    for (const user of users) {
      // Load user's notification preferences
      const userPrefs = await getUserNotificationPreferences(user.id);
      
      if (userPrefs.length === 0) {
        console.log(`⏭️ Skipping user ${user.id} - no enabled notification preferences`);
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

        // Send notification based on type
        if (pref.notification_type === 'email') {
          const userEmail = await getUserEmail(user.id);
          if (!userEmail) {
            console.log(`📧 No email found for user ${user.id}`);
            await logNotificationToDatabase(user.id, 'email', null, 'failed', undefined, 'No email address found');
            continue;
          }

          const htmlContent = generateEmailTemplate(relevantEvents, userName, pref.frequency_days);
          
          // Try Supabase SMTP first, fallback to SendGrid
          let result;
          try {
            result = await sendEmailViaSupabase({
              to: userEmail,
              subject: `AGORA: ${relevantEvents.length} Upcoming Event${relevantEvents.length > 1 ? 's' : ''} in ${pref.frequency_days} Day${pref.frequency_days > 1 ? 's' : ''}`,
              htmlContent: htmlContent
            });
            
            // If Supabase SMTP fails, try SendGrid
            if (!result.success) {
              console.log('Supabase SMTP failed, trying SendGrid...');
              result = await sendEmailNotification({
                to: userEmail,
                subject: `AGORA: ${relevantEvents.length} Upcoming Event${relevantEvents.length > 1 ? 's' : ''} in ${pref.frequency_days} Day${pref.frequency_days > 1 ? 's' : ''}`,
                htmlContent: htmlContent
              });
            }
          } catch (error) {
            console.log('Supabase SMTP error, trying SendGrid...');
            result = await sendEmailNotification({
              to: userEmail,
              subject: `AGORA: ${relevantEvents.length} Upcoming Event${relevantEvents.length > 1 ? 's' : ''} in ${pref.frequency_days} Day${pref.frequency_days > 1 ? 's' : ''}`,
              htmlContent: htmlContent
            });
          }

          await logNotificationToDatabase(
            user.id, 
            'email', 
            null, 
            result.success ? 'sent' : 'failed',
            result.messageId,
            result.error
          );

        } else if (pref.notification_type === 'sms') {
          const userPhone = await getUserPhone(user.id);
          if (!userPhone) {
            console.log(`📱 No phone number found for user ${user.id}`);
            await logNotificationToDatabase(user.id, 'sms', null, 'failed', undefined, 'No phone number found');
            continue;
          }

          const smsMessage = generateSMSMessage(relevantEvents, userName, pref.frequency_days);
          const result = await sendSMSNotification({
            to: userPhone,
            message: smsMessage
          });

          await logNotificationToDatabase(
            user.id, 
            'sms', 
            null, 
            result.success ? 'sent' : 'failed',
            result.messageId,
            result.error
          );

        } else if (pref.notification_type === 'desktop') {
          const result = await sendDesktopNotification(
            `AGORA: ${relevantEvents.length} Upcoming Event${relevantEvents.length > 1 ? 's' : ''}`,
            {
              body: `You have ${relevantEvents.length} upcoming event${relevantEvents.length > 1 ? 's' : ''} in ${pref.frequency_days} day${pref.frequency_days > 1 ? 's' : ''}`,
              tag: 'agora-notifications',
              requireInteraction: false
            }
          );

          await logNotificationToDatabase(
            user.id, 
            'desktop', 
            null, 
            result.success ? 'sent' : 'failed',
            result.messageId,
            result.error
          );

        } else if (pref.notification_type === 'mobile') {
          const result = await sendMobileNotification(
            user.id,
            `AGORA: ${relevantEvents.length} Upcoming Event${relevantEvents.length > 1 ? 's' : ''}`,
            `You have ${relevantEvents.length} upcoming event${relevantEvents.length > 1 ? 's' : ''} in ${pref.frequency_days} day${pref.frequency_days > 1 ? 's' : ''}`,
            { events: relevantEvents.map(e => e.eventID) }
          );

          await logNotificationToDatabase(
            user.id, 
            'mobile', 
            null, 
            result.success ? 'sent' : 'failed',
            result.messageId,
            result.error
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

// Function to schedule notifications (would be called by a cron job or scheduler)
export const scheduleEventNotifications = async (): Promise<void> => {
  console.log('⏰ Scheduling event notifications...');
  
  // In production, this would be called by a scheduler
  // For now, we'll just run it immediately
  await processEventNotifications();
};



export default {
  processEventNotifications,
  scheduleEventNotifications,
}; 