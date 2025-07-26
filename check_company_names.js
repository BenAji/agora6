import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkCompanyNames() {
  try {
    console.log('Fetching host company names from events table...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('hostCompany, eventID, eventName')
      .not('hostCompany', 'is', null);

    if (eventsError) throw eventsError;

    console.log('Fetching company names from gics_companies table...');
    const { data: companies, error: companiesError } = await supabase
      .from('gics_companies')
      .select('companyName, tickerSymbol, companyID');

    if (companiesError) throw companiesError;

    // Get unique host company names
    const hostCompanies = [...new Set(events.map(e => e.hostCompany))].sort();
    const companyNames = companies.map(c => c.companyName).sort();

    console.log('\n=== HOST COMPANY NAMES (from events table) ===');
    hostCompanies.forEach(name => {
      const count = events.filter(e => e.hostCompany === name).length;
      console.log(`"${name}" (${count} events)`);
    });

    console.log('\n=== COMPANY NAMES (from gics_companies table) ===');
    companyNames.forEach(name => console.log(`"${name}"`));

    console.log('\n=== DETAILED ANALYSIS ===');
    
    // Check each host company against gics_companies
    const mismatches = [];
    const matches = [];
    
    hostCompanies.forEach(hostName => {
      const matchingCompany = companies.find(company => {
        // Normalize names for comparison
        const normalizedHost = hostName
          .replace(/\.?Corp\.?/i, '')
          .replace(/\.?Inc\.?/i, '')
          .replace(/\.?LLC\.?/i, '')
          .replace(/\.?Ltd\.?/i, '')
          .replace(/\.?Limited\.?/i, '')
          .replace(/\.?Company\.?/i, '')
          .replace(/\.?Co\.?/i, '')
          .replace(/\.?Incorporated\.?/i, '')
          .replace(/\.?Corporation\.?/i, '')
          .trim();

        const normalizedCompany = company.companyName
          .replace(/\.?Corp\.?/i, '')
          .replace(/\.?Inc\.?/i, '')
          .replace(/\.?LLC\.?/i, '')
          .replace(/\.?Ltd\.?/i, '')
          .replace(/\.?Limited\.?/i, '')
          .replace(/\.?Company\.?/i, '')
          .replace(/\.?Co\.?/i, '')
          .replace(/\.?Incorporated\.?/i, '')
          .replace(/\.?Corporation\.?/i, '')
          .trim();

        return normalizedHost.toLowerCase() === normalizedCompany.toLowerCase();
      });

      if (matchingCompany) {
        matches.push({
          hostName,
          companyName: matchingCompany.companyName,
          tickerSymbol: matchingCompany.tickerSymbol
        });
      } else {
        mismatches.push(hostName);
      }
    });

    console.log('\n=== MATCHES FOUND ===');
    matches.forEach(match => {
      console.log(`"${match.hostName}" -> "${match.companyName}" (${match.tickerSymbol})`);
    });

    console.log('\n=== MISMATCHES (need to be fixed) ===');
    if (mismatches.length === 0) {
      console.log('No mismatches found! All host company names match gics_companies table.');
    } else {
      mismatches.forEach(name => {
        console.log(`"${name}" -> NO MATCH FOUND`);
      });
    }

    // Show specific examples that need fixing
    console.log('\n=== SPECIFIC EXAMPLES TO FIX ===');
    const examplesToFix = [
      { from: 'Microsoft Corp.', to: 'Microsoft Corporation' },
      { from: 'NVIDIA Corp.', to: 'NVIDIA Corporation' },
      { from: 'Qualcomm Corp.', to: 'Qualcomm Incorporated' },
      { from: 'Intel Corp.', to: 'Intel Corporation' },
      { from: 'Oracle Corp.', to: 'Oracle Corporation' },
      { from: 'IBM Corp.', to: 'International Business Machines Corporation' },
      { from: 'Cisco Systems', to: 'Cisco Systems Inc.' },
      { from: 'Advanced Micro Devices', to: 'Advanced Micro Devices Inc.' },
      { from: 'Adobe Inc.', to: 'Adobe Inc.' },
      { from: 'Salesforce Inc.', to: 'Salesforce Inc.' },
      { from: 'Meta Platforms', to: 'Meta Platforms Inc.' },
      { from: 'Netflix Inc.', to: 'Netflix Inc.' }
    ];

    examplesToFix.forEach(example => {
      const hasFrom = hostCompanies.includes(example.from);
      const hasTo = companyNames.includes(example.to);
      console.log(`${example.from} -> ${example.to} | From exists: ${hasFrom} | To exists: ${hasTo}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkCompanyNames(); 