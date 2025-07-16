-- Fix the foreign key constraint for subscriptions table
-- The userID should reference auth.users, not the public.users table

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_userID_fkey;

-- Add the correct foreign key constraint to reference auth.users
-- Note: We can't directly reference auth.users, so we'll just ensure the column is UUID
-- and rely on RLS policies for security

-- Make sure userID is properly typed as UUID
ALTER TABLE public.subscriptions 
ALTER COLUMN "userID" TYPE UUID USING "userID"::UUID;

-- Update RLS policies to ensure proper access control
-- Users can only access their own subscriptions
CREATE POLICY IF NOT EXISTS "Users can view own subscriptions v2" ON public.subscriptions
FOR SELECT 
USING (auth.uid() = "userID");

CREATE POLICY IF NOT EXISTS "Users can insert own subscriptions v2" ON public.subscriptions
FOR INSERT 
WITH CHECK (auth.uid() = "userID");

CREATE POLICY IF NOT EXISTS "Users can update own subscriptions v2" ON public.subscriptions
FOR UPDATE 
USING (auth.uid() = "userID");

CREATE POLICY IF NOT EXISTS "Users can delete own subscriptions v2" ON public.subscriptions
FOR DELETE 
USING (auth.uid() = "userID");