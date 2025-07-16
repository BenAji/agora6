-- Fix the subscriptions table by dropping all policies first
-- Drop all existing policies that depend on userID
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Drop the foreign key constraint if it exists
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_userID_fkey;

-- Now we can safely alter the column type
ALTER TABLE public.subscriptions 
ALTER COLUMN "userID" TYPE UUID USING "userID"::UUID;

-- Recreate the RLS policies with corrected access control
CREATE POLICY "users_can_read_own_subscriptions" ON public.subscriptions
FOR SELECT 
USING (auth.uid() = "userID");

CREATE POLICY "users_can_insert_own_subscriptions" ON public.subscriptions
FOR INSERT 
WITH CHECK (auth.uid() = "userID");

CREATE POLICY "users_can_update_own_subscriptions" ON public.subscriptions
FOR UPDATE 
USING (auth.uid() = "userID");

CREATE POLICY "users_can_delete_own_subscriptions" ON public.subscriptions
FOR DELETE 
USING (auth.uid() = "userID");