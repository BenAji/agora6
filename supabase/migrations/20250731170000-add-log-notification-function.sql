-- Create a function for logging notifications as a fallback
CREATE OR REPLACE FUNCTION public.log_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_event_ids TEXT[],
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notification_logs (
    user_id,
    notification_type,
    event_ids,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_event_ids,
    p_status,
    p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 