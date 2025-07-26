import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkExistingData() {
  try {
    console.log('Checking existing data in database...\n');

    // Check events table
    console.log('=== EVENTS TABLE ===');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(10);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    } else {
      console.log(`Found ${events.length} events`);
      if (events.length > 0) {
        console.log('Sample events:');
        events.forEach((event, index) => {
          console.log(`${index + 1}. "${event.eventName}" by "${event.hostCompany}"`);
        });
      }
    }

    // Check gics_companies table
    console.log('\n=== GICS_COMPANIES TABLE ===');
    const { data: companies, error: companiesError } = await supabase
      .from('gics_companies')
      .select('*')
      .limit(10);

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    } else {
      console.log(`Found ${companies.length} companies`);
      if (companies.length > 0) {
        console.log('Sample companies:');
        companies.forEach((company, index) => {
          console.log(`${index + 1}. "${company.companyName}" (${company.tickerSymbol})`);
        });
      }
    }

    // Check user_companies table
    console.log('\n=== USER_COMPANIES TABLE ===');
    const { data: userCompanies, error: userCompaniesError } = await supabase
      .from('user_companies')
      .select('*')
      .limit(10);

    if (userCompaniesError) {
      console.error('Error fetching user companies:', userCompaniesError);
    } else {
      console.log(`Found ${userCompanies.length} user companies`);
      if (userCompanies.length > 0) {
        console.log('Sample user companies:');
        userCompanies.forEach((company, index) => {
          console.log(`${index + 1}. "${company.companyName}"`);
        });
      }
    }

    // Get all unique host company names from events
    console.log('\n=== ALL HOST COMPANY NAMES ===');
    const { data: allEvents, error: allEventsError } = await supabase
      .from('events')
      .select('hostCompany')
      .not('hostCompany', 'is', null);

    if (allEventsError) {
      console.error('Error fetching all events:', allEventsError);
    } else {
      const hostCompanies = [...new Set(allEvents.map(e => e.hostCompany))].sort();
      console.log(`Found ${hostCompanies.length} unique host companies:`);
      hostCompanies.forEach(name => {
        const count = allEvents.filter(e => e.hostCompany === name).length;
        console.log(`  "${name}" (${count} events)`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkExistingData(); 