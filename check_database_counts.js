import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkDatabaseCounts() {
  console.log('🔍 Checking database counts...\n');
  
  try {
    // Check events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (eventsError) {
      console.log('❌ Events query error:', eventsError);
    } else {
      console.log(`📅 Events count: ${eventsCount || 0}`);
    }

    // Check companies count
    const { count: companiesCount, error: companiesError } = await supabase
      .from('gics_companies')
      .select('*', { count: 'exact', head: true });
    
    if (companiesError) {
      console.log('❌ Companies query error:', companiesError);
    } else {
      console.log(`🏢 Companies count: ${companiesCount || 0}`);
    }

    // Check users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.log('❌ Users query error:', usersError);
    } else {
      console.log(`👤 Users count: ${usersCount || 0}`);
    }

    // If all counts are 0, offer to insert sample data
    if ((eventsCount || 0) === 0 && (companiesCount || 0) === 0) {
      console.log('\n⚠️ Database appears to be empty!');
      console.log('Would you like to insert sample data? (y/n)');
      
      // For now, let's just show what we found
      console.log('\n📋 Summary:');
      console.log(`   Events: ${eventsCount || 0}`);
      console.log(`   Companies: ${companiesCount || 0}`);
      console.log(`   Users: ${usersCount || 0}`);
      
      console.log('\n💡 To fix the landing page stats:');
      console.log('   1. Run the fix_signup_issues.sql script first');
      console.log('   2. Then run the company_name_fix_final.sql script');
      console.log('   3. Or manually insert some sample data');
    }

  } catch (error) {
    console.log('❌ Error checking database:', error.message);
  }
}

// Run the check
checkDatabaseCounts().catch(console.error); 