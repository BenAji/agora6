-- Add validation trigger to ensure startDate is less than endDate
CREATE OR REPLACE FUNCTION public.validate_event_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."endDate" IS NOT NULL AND NEW."startDate" >= NEW."endDate" THEN
    RAISE EXCEPTION 'Start date must be less than end date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for insert and update operations
CREATE TRIGGER validate_event_dates_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_dates();