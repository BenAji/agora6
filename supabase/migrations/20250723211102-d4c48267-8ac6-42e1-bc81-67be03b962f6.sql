-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'desktop', 'mobile')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency_days INTEGER NOT NULL DEFAULT 1 CHECK (frequency_days > 0),
  gics_sectors TEXT[],
  companies UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification preferences" 
ON public.notification_preferences 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = notification_preferences.user_id));

CREATE POLICY "Users can create their own notification preferences" 
ON public.notification_preferences 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = notification_preferences.user_id));

CREATE POLICY "Users can update their own notification preferences" 
ON public.notification_preferences 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = notification_preferences.user_id));

CREATE POLICY "Users can delete their own notification preferences" 
ON public.notification_preferences 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = notification_preferences.user_id));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification_logs table for tracking sent notifications
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  event_id UUID,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for logs (users can only see their own logs)
CREATE POLICY "Users can view their own notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = notification_logs.user_id));

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;