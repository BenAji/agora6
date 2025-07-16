-- Temporarily disable the trigger to fix existing data
DROP TRIGGER IF EXISTS validate_event_dates_trigger ON public.events;

-- Fix existing events where endDate is before or equal to startDate
-- Set endDate to one day after startDate for these invalid entries
UPDATE events 
SET "endDate" = "startDate" + INTERVAL '1 day'
WHERE "endDate" IS NOT NULL AND "startDate" >= "endDate";

-- Re-create the validation trigger
CREATE TRIGGER validate_event_dates_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_dates();