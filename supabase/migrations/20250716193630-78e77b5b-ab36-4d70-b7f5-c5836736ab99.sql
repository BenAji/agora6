-- Update the rsvps table to reference profiles instead of users table
-- First, drop the existing foreign key constraint
ALTER TABLE rsvps DROP CONSTRAINT IF EXISTS "rsvps_userID_fkey";

-- Add new foreign key constraint to profiles table using correct column names
ALTER TABLE rsvps 
ADD CONSTRAINT "rsvps_userID_fkey" 
FOREIGN KEY ("userID") REFERENCES profiles(user_id) ON DELETE CASCADE;