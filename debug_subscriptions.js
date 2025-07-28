const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mqbeopporomwnjcolnmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSubscriptions() {
  try {
    // First, let's see all subscriptions
    console.log('=== All Subscriptions ===');
    const { data: allSubscriptions, error: allError } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (allError) {
      console.error('Error fetching all subscriptions:', allError);
      return;
    }
    
    console.log('Total subscriptions:', allSubscriptions.length);
    console.log('Sample subscriptions:', allSubscriptions.slice(0, 3));
    
    // Now let's look for Benjamin's profile
    console.log('\n=== All Profiles ===');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }
    
    console.log('Total profiles:', allProfiles.length);
    console.log('Profiles:', allProfiles);
    
    // Look for Benjamin's profile
    const benjaminProfile = allProfiles.find(p => 
      p.first_name?.toLowerCase().includes('benjamin') || 
      p.last_name?.toLowerCase().includes('benjamin')
    );
    
    if (benjaminProfile) {
      console.log('\n=== Benjamin\'s Profile ===');
      console.log(benjaminProfile);
      
      // Get Benjamin's subscriptions
      console.log('\n=== Benjamin\'s Subscriptions ===');
      const { data: benjaminSubscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('userID', benjaminProfile.id);
      
      if (subError) {
        console.error('Error fetching Benjamin\'s subscriptions:', subError);
        return;
      }
      
      console.log('Benjamin\'s subscriptions:', benjaminSubscriptions);
      console.log('Count:', benjaminSubscriptions.length);
    } else {
      console.log('\nNo profile found for Benjamin');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugSubscriptions(); 