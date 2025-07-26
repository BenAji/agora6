import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function debugSignup() {
  console.log('🔍 Starting signup debug process...\n');
  
  // Step 1: Check auth settings
  console.log('1. Checking auth settings...');
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ Session check error:', sessionError);
    } else {
      console.log('✅ Auth client working, current session:', session.session ? 'Active' : 'None');
    }
  } catch (error) {
    console.log('❌ Auth check failed:', error.message);
  }
  
  // Step 2: Check profiles table structure
  console.log('\n2. Checking profiles table structure...');
  try {
    const { data: profilesInfo, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
      if (profilesInfo.length > 0) {
        console.log('   Sample profile columns:', Object.keys(profilesInfo[0]));
      } else {
        console.log('   No profiles found (empty table)');
      }
    }
  } catch (error) {
    console.log('❌ Profiles check failed:', error.message);
  }
  
  // Step 3: Test with a valid email format
  console.log('\n3. Testing signup process with valid email...');
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'INVESTMENT_ANALYST',
          company_id: null,
        }
      }
    });
    
    if (error) {
      console.log('❌ Signup failed:', error);
      console.log('   Error code:', error.code);
      console.log('   Error message:', error.message);
      console.log('   Error status:', error.status);
      
      // Check for specific error conditions
      if (error.code === 'signup_disabled') {
        console.log('🚨 SIGNUP IS DISABLED in Supabase settings!');
      } else if (error.code === 'email_address_invalid') {
        console.log('🚨 Email validation issue!');
      } else if (error.code === 'weak_password') {
        console.log('🚨 Password requirements not met!');
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('   User created at:', data.user?.created_at);
      
      // Wait a moment for the trigger to process
      console.log('\n   Waiting for profile creation trigger...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile was created
      if (data.user?.id) {
        console.log('   Checking if profile was created...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        if (profileError) {
          console.log('❌ Profile creation failed:', profileError);
          console.log('   This means the trigger function has an issue!');
        } else {
          console.log('✅ Profile created successfully:', profile);
        }
      }
      
      // Clean up test user (note: this won't work with normal API key)
      console.log('\n   Note: Test user created - you may want to delete it manually');
    }
  } catch (error) {
    console.log('❌ Signup test failed:', error.message);
  }
  
  // Step 4: Check RLS policies on profiles
  console.log('\n4. Checking RLS policies on profiles...');
  try {
    const { error: directInsertError } = await supabase
      .from('profiles')
      .insert({
        user_id: '12345678-1234-1234-1234-123456789012',
        first_name: 'Test',
        last_name: 'Direct',
        role: 'INVESTMENT_ANALYST'
      });
    
    if (directInsertError) {
      console.log('✅ RLS working correctly (direct insert blocked)');
      console.log('   Error:', directInsertError.message);
    } else {
      console.log('⚠️ RLS might not be configured correctly - direct insert succeeded');
    }
  } catch (error) {
    console.log('✅ RLS working correctly (direct insert blocked):', error.message);
  }
  
  // Step 5: Check if trigger function exists (indirect check)
  console.log('\n5. Checking trigger indirectly...');
  try {
    // Try to query trigger info from pg_trigger (might not work due to permissions)
    const { data, error } = await supabase
      .rpc('check_trigger_exists', { trigger_name: 'on_auth_user_created' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    console.log('ℹ️ Trigger check:', error || 'Cannot check triggers directly');
  } catch (error) {
    console.log('ℹ️ Trigger check not available:', error.message);
  }
  
  console.log('\n🏁 Debug process complete!');
  console.log('\n📋 Summary:');
  console.log('   - If signup fails with "signup_disabled", enable it in Supabase Auth settings');
  console.log('   - If signup works but profile creation fails, the trigger function needs fixing');
  console.log('   - Check the Supabase dashboard logs for more details');
}

// Run the debug
debugSignup().catch(console.error); 