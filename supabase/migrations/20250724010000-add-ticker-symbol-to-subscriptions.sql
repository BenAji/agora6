-- Add tickerSymbol field to subscriptions table for individual company subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS "tickerSymbol" TEXT;

-- Update RLS policies to include tickerSymbol
DROP POLICY IF EXISTS "users_can_read_own_subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "users_can_insert_own_subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "users_can_update_own_subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "users_can_delete_own_subscriptions" ON public.subscriptions;

-- Recreate RLS policies with tickerSymbol support
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

-- Add index for better performance when querying by tickerSymbol
CREATE INDEX IF NOT EXISTS "subscriptions_ticker_symbol_idx" ON public.subscriptions("tickerSymbol"); 