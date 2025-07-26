import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testLogin() {
  console.log('🔍 Testing login functionality...\n');

  // Test 1: Check if the email exists
  console.log('1. Checking if user exists...');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('❌ Error checking users:', error.message);
    } else {
      const user = users.users.find(u => u.email === 'ayoadebenjamin@gmail.com');
      if (user) {
        console.log('✅ User found:', {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        });
      } else {
        console.log('❌ User not found in database');
      }
    }
  } catch (error) {
    console.log('❌ Error accessing admin functions:', error.message);
  }

  // Test 2: Try to sign in
  console.log('\n2. Attempting to sign in...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'ayoadebenjamin@gmail.com',
      password: 'your_password_here' // Replace with actual password
    });
    
    if (error) {
      console.log('❌ Sign in failed:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('✅ Sign in successful:', {
        user_id: data.user?.id,
        email: data.user?.email,
        session: !!data.session
      });
    }
  } catch (error) {
    console.log('❌ Unexpected error during sign in:', error.message);
  }

  // Test 3: Check auth settings
  console.log('\n3. Checking auth settings...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Error getting session:', error.message);
    } else {
      console.log('📊 Current session:', {
        has_session: !!data.session,
        user_id: data.session?.user?.id
      });
    }
  } catch (error) {
    console.log('❌ Error checking session:', error.message);
  }
}

// Test 4: Check if email confirmation is required
async function checkEmailConfirmation() {
  console.log('\n4. Checking email confirmation status...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'ayoadebenjamin@gmail.com',
      password: 'test_password_123'
    });
    
    if (error) {
      console.log('❌ Sign up test failed:', error.message);
    } else {
      console.log('📧 Sign up response:', {
        user_id: data.user?.id,
        email_confirmed: data.user?.email_confirmed_at,
        needs_confirmation: !data.user?.email_confirmed_at
      });
    }
  } catch (error) {
    console.log('❌ Error testing sign up:', error.message);
  }
}

// Run the tests
async function runTests() {
  await testLogin();
  await checkEmailConfirmation();
  
  console.log('\n🔧 Troubleshooting Tips:');
  console.log('1. Make sure the email is confirmed in Supabase');
  console.log('2. Check if the password is correct');
  console.log('3. Verify that the user account exists in the auth.users table');
  console.log('4. Check if there are any RLS policies blocking access');
  console.log('5. Ensure the Supabase project is active and not paused');
}

runTests().catch(console.error); 