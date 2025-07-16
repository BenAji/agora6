-- Fix the foreign key constraint for subscriptions table
-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_userID_fkey;

-- Ensure userID is properly typed as UUID
ALTER TABLE public.subscriptions 
ALTER COLUMN "userID" TYPE UUID USING "userID"::UUID;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own subscriptions v2" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions v2" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions v2" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions v2" ON public.subscriptions;

-- Create new RLS policies with proper names
CREATE POLICY "enable_read_own_subscriptions" ON public.subscriptions
FOR SELECT 
USING (auth.uid() = "userID");

CREATE POLICY "enable_insert_own_subscriptions" ON public.subscriptions
FOR INSERT 
WITH CHECK (auth.uid() = "userID");

CREATE POLICY "enable_update_own_subscriptions" ON public.subscriptions
FOR UPDATE 
USING (auth.uid() = "userID");

CREATE POLICY "enable_delete_own_subscriptions" ON public.subscriptions
FOR DELETE 
USING (auth.uid() = "userID");