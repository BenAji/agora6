-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('email', 'sms', 'desktop', 'mobile')),
    enabled BOOLEAN DEFAULT true,
    frequency_days INTEGER DEFAULT 1,
    gics_sectors TEXT[],
    companies TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- Create notification_log table
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    event_id UUID REFERENCES public.events("eventID") ON DELETE CASCADE,
    status TEXT CHECK (status IN ('sent', 'failed', 'pending')),
    message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_notification_preferences" ON public.notification_preferences
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "users_can_insert_own_notification_preferences" ON public.notification_preferences
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "users_can_update_own_notification_preferences" ON public.notification_preferences
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "users_can_delete_own_notification_preferences" ON public.notification_preferences
FOR DELETE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Add RLS policies for notification_log
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_notification_logs" ON public.notification_log
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "users_can_insert_own_notification_logs" ON public.notification_log
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "notification_preferences_user_id_idx" ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS "notification_preferences_type_idx" ON public.notification_preferences(notification_type);
CREATE INDEX IF NOT EXISTS "notification_log_user_id_idx" ON public.notification_log(user_id);
CREATE INDEX IF NOT EXISTS "notification_log_status_idx" ON public.notification_log(status);
CREATE INDEX IF NOT EXISTS "notification_log_sent_at_idx" ON public.notification_log(sent_at);

-- Add trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 