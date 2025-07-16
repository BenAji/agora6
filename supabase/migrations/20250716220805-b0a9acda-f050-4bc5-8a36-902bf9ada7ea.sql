-- Remove the foreign key constraint with exact case-sensitive name
ALTER TABLE public.subscriptions 
DROP CONSTRAINT "subscriptions_userID_fkey";