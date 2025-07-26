-- Fix the update_updated_at_column function and recreate all triggers
-- Drop all triggers that depend on the function first

-- Drop all triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_gics_companies_updated_at ON gics_companies;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_rsvps_updated_at ON rsvps;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;

-- Now drop the function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with correct column names
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Handle different column naming conventions
    IF TG_TABLE_NAME = 'events' THEN
        NEW."updatedAt" = now();
    ELSIF TG_TABLE_NAME = 'users' THEN
        NEW."updatedAt" = now();
    ELSIF TG_TABLE_NAME = 'gics_companies' THEN
        NEW."updatedAt" = now();
    ELSIF TG_TABLE_NAME = 'subscriptions' THEN
        NEW."updatedAt" = now();
    ELSIF TG_TABLE_NAME = 'rsvps' THEN
        NEW."updatedAt" = now();
    ELSIF TG_TABLE_NAME = 'notification_preferences' THEN
        NEW."updatedAt" = now();
    ELSIF TG_TABLE_NAME = 'profiles' THEN
        NEW.updated_at = now();
    ELSE
        -- Default to updated_at for any other tables
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate all triggers
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gics_companies_updated_at
    BEFORE UPDATE ON public.gics_companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at
    BEFORE UPDATE ON public.rsvps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 