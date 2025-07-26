-- Fix missing RLS policies for RSVPs table
-- The RSVPs table has RLS enabled but no policies, which blocks all operations

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can create own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.rsvps;

-- Also ensure the userID column is properly typed as UUID (do this before creating policies)
ALTER TABLE public.rsvps 
ALTER COLUMN "userID" TYPE UUID USING "userID"::UUID;

-- Create RLS policies for RSVPs table
CREATE POLICY "Users can view own RSVPs" 
ON public.rsvps 
FOR SELECT 
USING (auth.uid() = "userID");

CREATE POLICY "Users can create own RSVPs" 
ON public.rsvps 
FOR INSERT 
WITH CHECK (auth.uid() = "userID");

CREATE POLICY "Users can update own RSVPs" 
ON public.rsvps 
FOR UPDATE 
USING (auth.uid() = "userID");

CREATE POLICY "Users can delete own RSVPs" 
ON public.rsvps 
FOR DELETE 
USING (auth.uid() = "userID");

-- Show current RSVPs to verify the fix
SELECT COUNT(*) as total_rsvps FROM public.rsvps; 