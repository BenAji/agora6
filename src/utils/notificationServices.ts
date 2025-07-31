import { supabase } from '@/integrations/supabase/client';

// Email Service Configuration (SendGrid)
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'notifications@agora.com';

// SMS Service Configuration (Twilio)
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';

interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface SMSNotification {
  to: string;
  message: string;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// SendGrid Email Service
export const sendEmailNotification = async (notification: EmailNotification): Promise<NotificationResult> => {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured');
    return {
      success: false,
      error: 'SendGrid API key not configured'
    };
  }

  try {
    // In production, you would use the SendGrid SDK
    // For now, we'll simulate the API call
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: notification.to }],
            subject: notification.subject,
          },
        ],
        from: { email: SENDGRID_FROM_EMAIL },
        content: [
          {
            type: 'text/html',
            value: notification.htmlContent,
          },
          ...(notification.textContent ? [{
            type: 'text/plain',
            value: notification.textContent,
          }] : []),
        ],
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.id || `sg-${Date.now()}`,
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `SendGrid API error: ${response.status} - ${error}`,
      };
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Twilio SMS Service
export const sendSMSNotification = async (notification: SMSNotification): Promise<NotificationResult> => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not configured');
    return {
      success: false,
      error: 'Twilio credentials not configured'
    };
  }

  try {
    // In production, you would use the Twilio SDK
    // For now, we'll simulate the API call
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: notification.to,
        From: TWILIO_PHONE_NUMBER,
        Body: notification.message,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.sid || `tw-${Date.now()}`,
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `Twilio API error: ${response.status} - ${error}`,
      };
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Desktop Notification Service (Browser API)
export const sendDesktopNotification = async (title: string, options: NotificationOptions = {}): Promise<NotificationResult> => {
  try {
    if (!('Notification' in window)) {
      return {
        success: false,
        error: 'Desktop notifications not supported',
      };
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return {
          success: false,
          error: 'Notification permission denied',
        };
      }
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      return {
        success: true,
        messageId: `desktop-${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: 'Notification permission not granted',
      };
    }
  } catch (error) {
    console.error('Error sending desktop notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Mobile Push Notification Service (Firebase/OneSignal)
export const sendMobileNotification = async (
  userId: string, 
  title: string, 
  body: string, 
  data?: Record<string, any>
): Promise<NotificationResult> => {
  try {
    // In production, you would integrate with Firebase Cloud Messaging or OneSignal
    // For now, we'll simulate the API call
    const response = await fetch('/api/push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId || `mobile-${Date.now()}`,
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `Mobile notification error: ${response.status} - ${error}`,
      };
    }
  } catch (error) {
    console.error('Error sending mobile notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Supabase SMTP Email Service
export const sendEmailViaSupabase = async (notification: EmailNotification): Promise<NotificationResult> => {
  try {
    // Use Supabase's built-in email functionality via Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        error: 'Supabase URL or Anon Key not configured'
      };
    }

    // Use the send-notification function for email sending
    const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        userId: 'system',
        notificationType: 'email',
        events: [{
          eventID: 'system-notification',
          eventName: 'System Notification',
          eventType: 'SYSTEM',
          hostCompany: 'AGORA Platform',
          startDate: new Date().toISOString(),
          location: 'System',
          description: 'System notification for email verification.'
        }],
        userProfile: {
          first_name: 'System',
          last_name: 'User',
          user_id: notification.to
        },
        frequencyDays: 1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Supabase SMTP error: ${response.status} - ${error}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.messageId || `supabase-${Date.now()}`,
    };
  } catch (error) {
    console.error('Error sending email via Supabase SMTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Log notification to database
export const logNotificationToDatabase = async (
  userId: string,
  notificationType: string,
  eventId: string | null,
  status: 'sent' | 'failed' | 'pending',
  messageId?: string,
  error?: string
): Promise<void> => {
  try {
    const { error: dbError } = await supabase
      .from('notification_log')
      .insert({
        user_id: userId,
        notification_type: notificationType,
        event_id: eventId,
        status: status,
        message: error || `Notification ${status}${messageId ? ` - ID: ${messageId}` : ''}`,
      });

    if (dbError) {
      console.error('Error logging notification to database:', dbError);
    }
  } catch (error) {
    console.error('Error logging notification to database:', error);
  }
};

// Get user's email from profile
export const getUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user email:', error);
      return null;
    }

    // In a real implementation, you'd need to add an email field to profiles table
    // For now, we'll use the user_id as email placeholder
    return `${data.user_id}@agora.com`;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};

// Get user's phone number from profile
export const getUserPhone = async (userId: string): Promise<string | null> => {
  try {
    // Note: phone_number field doesn't exist in profiles table yet
    // You'll need to add this field to the profiles table
    console.warn('Phone number field not available in profiles table');
    return null;
  } catch (error) {
    console.error('Error getting user phone:', error);
    return null;
  }
};



export default {
  sendEmailNotification,
  sendSMSNotification,
  sendDesktopNotification,
  sendMobileNotification,
  logNotificationToDatabase,
  getUserEmail,
  getUserPhone,
}; 