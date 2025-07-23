-- Update RSVPs table to reference profiles instead of auth.users
-- First, drop existing foreign key constraint if it exists
ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS "rsvps_userID_fkey";

-- Update the userID column to reference profiles.id instead of profiles.user_id
-- Since we want to use profile ID, we need to update existing data first
UPDATE public.rsvps 
SET "userID" = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.user_id = rsvps."userID"
)
WHERE "userID" IS NOT NULL;

-- Add foreign key constraint to profiles table using profile ID
ALTER TABLE public.rsvps 
ADD CONSTRAINT "rsvps_userID_profiles_fkey" 
FOREIGN KEY ("userID") REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policies to work with profile IDs
DROP POLICY IF EXISTS "Users can create own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.rsvps;

-- Create new RLS policies using profile ID
CREATE POLICY "Users can create own RSVPs" ON public.rsvps
FOR INSERT 
WITH CHECK (
  "userID" IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own RSVPs" ON public.rsvps
FOR SELECT 
USING (
  "userID" IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own RSVPs" ON public.rsvps
FOR UPDATE 
USING (
  "userID" IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own RSVPs" ON public.rsvps
FOR DELETE 
USING (
  "userID" IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);