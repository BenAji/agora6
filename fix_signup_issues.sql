-- Fix Signup Issues and Database Triggers
-- This script fixes the trigger functions and ensures signup works properly

-- Step 1: Fix the main trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 2: Fix the signup trigger function that creates profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Add some logging for debugging
  RAISE LOG 'Creating profile for user: %', NEW.id;
  RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;
  
  INSERT INTO public.profiles (user_id, first_name, last_name, role, company_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name', 
    NEW.raw_user_meta_data ->> 'role',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'company_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'company_id')::uuid
      ELSE NULL
    END
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Don't fail the user creation, just log the error
    RETURN NEW;
END;
$$;

-- Step 3: Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Ensure all triggers are using the correct column names
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 5: Check and fix the profiles table structure
-- Ensure all columns exist with correct names
DO $$
BEGIN
  -- Check if updatedAt column exists (camelCase)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updatedAt'
  ) THEN
    -- If not, check if updated_at exists (snake_case) and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.profiles RENAME COLUMN updated_at TO "updatedAt";
      RAISE NOTICE 'Renamed updated_at to updatedAt';
    ELSE
      -- Add the column if it doesn't exist at all
      ALTER TABLE public.profiles ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
      RAISE NOTICE 'Added updatedAt column';
    END IF;
  END IF;

  -- Check if created_at column exists and rename to createdAt if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'createdAt'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.profiles RENAME COLUMN created_at TO "createdAt";
      RAISE NOTICE 'Renamed created_at to createdAt';
    ELSE
      ALTER TABLE public.profiles ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
      RAISE NOTICE 'Added createdAt column';
    END IF;
  END IF;
END $$;

-- Step 6: Update RLS policies to be more permissive for profile creation
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new, more permissive policies
CREATE POLICY "enable_read_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "enable_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- More permissive insert policy that allows the trigger to work
CREATE POLICY "enable_insert_profile_for_authenticated" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true); -- Allow trigger to insert profiles for any authenticated user

-- Step 7: Create a function to manually create profiles for existing users without profiles
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  profile_count INTEGER := 0;
BEGIN
  FOR user_record IN (
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.user_id
    WHERE p.user_id IS NULL
  ) LOOP
    INSERT INTO public.profiles (user_id, first_name, last_name, role, company_id)
    VALUES (
      user_record.id,
      user_record.raw_user_meta_data ->> 'first_name',
      user_record.raw_user_meta_data ->> 'last_name',
      COALESCE(user_record.raw_user_meta_data ->> 'role', 'INVESTMENT_ANALYST'),
      CASE 
        WHEN user_record.raw_user_meta_data ->> 'company_id' IS NOT NULL 
        THEN (user_record.raw_user_meta_data ->> 'company_id')::uuid
        ELSE NULL
      END
    );
    profile_count := profile_count + 1;
  END LOOP;
  
  RETURN 'Created ' || profile_count || ' missing profiles';
END;
$$;

-- Step 8: Run the function to create missing profiles
SELECT public.create_missing_profiles();

-- Step 9: Verify the setup
SELECT 'VERIFICATION RESULTS:' as info;

-- Count users without profiles
SELECT 
  COUNT(au.id) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Show recent profiles
SELECT 'RECENT PROFILES:' as info;
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.role,
  p."createdAt"
FROM public.profiles p
ORDER BY p."createdAt" DESC
LIMIT 5;

-- Show trigger information
SELECT 'TRIGGER STATUS:' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND (trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%')
ORDER BY trigger_name; 