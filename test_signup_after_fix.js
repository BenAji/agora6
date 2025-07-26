import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testSignupAfterFix() {
  console.log('🔧 Testing signup after database fix...\n');
  
  const timestamp = Date.now();
  const testEmail = `fixed-test-${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`📧 Test Email: ${testEmail}`);
  console.log(`🔑 Test Password: ${testPassword}\n`);
  
  try {
    console.log('⏳ Creating new user account...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Fixed',
          last_name: 'Test',
          role: 'INVESTMENT_ANALYST',
          company_id: null,
        }
      }
    });
    
    if (error) {
      console.log('❌ Signup failed:', error.message);
      return;
    }
    
    console.log('✅ User created successfully!');
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Created: ${data.user?.created_at}`);
    
    // Wait for trigger to process
    console.log('\n⏳ Waiting 5 seconds for profile creation trigger...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if profile was created
    console.log('🔍 Checking if profile was created...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
      console.log('   The trigger function still has issues!');
    } else {
      console.log('✅ Profile created successfully!');
      console.log('   Profile details:');
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   - Role: ${profile.role}`);
      console.log(`   - Created: ${profile.createdAt || profile.created_at}`);
    }
    
    // Test sign in with the new account
    console.log('\n🔐 Testing sign in with new account...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful!');
      console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
      
      // Sign out
      await supabase.auth.signOut();
      console.log('✅ Signed out successfully');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n🏁 Test complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. If profile creation failed, check Supabase logs');
  console.log('   2. If successful, try signing up through your app');
  console.log('   3. You may want to delete test users manually');
}

// Run the test
testSignupAfterFix().catch(console.error); 