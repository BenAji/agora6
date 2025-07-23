import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  notificationType: 'email' | 'sms' | 'desktop' | 'mobile';
  eventId?: string;
  subject?: string;
  message: string;
  htmlContent?: string;
  phoneNumber?: string;
  email?: string;
}

interface NotificationLog {
  user_id: string;
  notification_type: string;
  event_id?: string;
  status: 'sent' | 'failed' | 'pending';
  message_id?: string;
  error_message?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const sendEmail = async (to: string, subject: string, htmlContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  
  if (!sendGridApiKey) {
    console.error('SendGrid API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: {
          email: 'notifications@agora-platform.com',
          name: 'AGORA Platform'
        },
        content: [{
          type: 'text/html',
          value: htmlContent,
        }],
      }),
    });

    if (response.ok) {
      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;
      console.log('Email sent successfully:', { to, subject, messageId });
      return { success: true, messageId };
    } else {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendSMS = async (to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('SMS sent successfully:', { to, messageId: result.sid });
      return { success: true, messageId: result.sid };
    } else {
      const errorText = await response.text();
      console.error('Twilio error:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

const logNotification = async (log: NotificationLog) => {
  try {
    const { error } = await supabase
      .from('notification_logs')
      .insert(log);
    
    if (error) {
      console.error('Failed to log notification:', error);
    }
  } catch (error) {
    console.error('Error logging notification:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      notificationType, 
      eventId, 
      subject, 
      message, 
      htmlContent, 
      phoneNumber, 
      email 
    }: NotificationRequest = await req.json();

    console.log(`Sending ${notificationType} notification to user ${userId}`);

    let result: { success: boolean; messageId?: string; error?: string };

    switch (notificationType) {
      case 'email':
        if (!email) {
          throw new Error('Email address is required for email notifications');
        }
        result = await sendEmail(email, subject || 'AGORA Notification', htmlContent || message);
        break;

      case 'sms':
        if (!phoneNumber) {
          throw new Error('Phone number is required for SMS notifications');
        }
        result = await sendSMS(phoneNumber, message);
        break;

      case 'desktop':
        // Desktop notifications are handled by the frontend
        result = { success: true, messageId: `desktop-${Date.now()}` };
        console.log('Desktop notification queued for user', userId);
        break;

      case 'mobile':
        // Mobile push notifications would be handled by a push service like Firebase
        result = { success: true, messageId: `mobile-${Date.now()}` };
        console.log('Mobile notification queued for user', userId);
        break;

      default:
        throw new Error(`Unsupported notification type: ${notificationType}`);
    }

    // Log the notification attempt
    await logNotification({
      user_id: userId,
      notification_type: notificationType,
      event_id: eventId,
      status: result.success ? 'sent' : 'failed',
      message_id: result.messageId,
      error_message: result.error,
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      }),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-notification function:', error);
    
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