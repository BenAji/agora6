-- Fix the update_updated_at_column function to handle both updatedAt and updated_at
-- The function was overwritten but the trigger still expects it to handle updatedAt

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function to handle both column naming conventions
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
        NEW.updated_at = now();
    ELSIF TG_TABLE_NAME = 'profiles' THEN
        NEW.updated_at = now();
    ELSE
        -- Default to updated_at for any other tables
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$; 