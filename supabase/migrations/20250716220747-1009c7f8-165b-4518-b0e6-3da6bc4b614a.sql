-- Remove the remaining foreign key constraint
ALTER TABLE public.subscriptions 
DROP CONSTRAINT subscriptions_userID_fkey;