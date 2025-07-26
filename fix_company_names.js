import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper function to generate UUID-like strings
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Sample GICS companies with proper names
const gicsCompanies = [
  { companyID: generateId(), companyName: 'Microsoft Corporation', tickerSymbol: 'MSFT', gicsSector: 'Information Technology', gicsSubCategory: 'Software' },
  { companyID: generateId(), companyName: 'Apple Inc.', tickerSymbol: 'AAPL', gicsSector: 'Information Technology', gicsSubCategory: 'Technology Hardware, Storage & Peripherals' },
  { companyID: generateId(), companyName: 'NVIDIA Corporation', tickerSymbol: 'NVDA', gicsSector: 'Information Technology', gicsSubCategory: 'Semiconductors & Semiconductor Equipment' },
  { companyID: generateId(), companyName: 'Intel Corporation', tickerSymbol: 'INTC', gicsSector: 'Information Technology', gicsSubCategory: 'Semiconductors & Semiconductor Equipment' },
  { companyID: generateId(), companyName: 'Qualcomm Incorporated', tickerSymbol: 'QCOM', gicsSector: 'Information Technology', gicsSubCategory: 'Semiconductors & Semiconductor Equipment' },
  { companyID: generateId(), companyName: 'Oracle Corporation', tickerSymbol: 'ORCL', gicsSector: 'Information Technology', gicsSubCategory: 'Software' },
  { companyID: generateId(), companyName: 'Cisco Systems Inc.', tickerSymbol: 'CSCO', gicsSector: 'Information Technology', gicsSubCategory: 'Communications Equipment' },
  { companyID: generateId(), companyName: 'International Business Machines Corporation', tickerSymbol: 'IBM', gicsSector: 'Information Technology', gicsSubCategory: 'IT Services' },
  { companyID: generateId(), companyName: 'Advanced Micro Devices Inc.', tickerSymbol: 'AMD', gicsSector: 'Information Technology', gicsSubCategory: 'Semiconductors & Semiconductor Equipment' },
  { companyID: generateId(), companyName: 'Adobe Inc.', tickerSymbol: 'ADBE', gicsSector: 'Information Technology', gicsSubCategory: 'Software' },
  { companyID: generateId(), companyName: 'Salesforce Inc.', tickerSymbol: 'CRM', gicsSector: 'Information Technology', gicsSubCategory: 'Software' },
  { companyID: generateId(), companyName: 'Meta Platforms Inc.', tickerSymbol: 'META', gicsSector: 'Communication Services', gicsSubCategory: 'Interactive Media & Services' },
  { companyID: generateId(), companyName: 'Netflix Inc.', tickerSymbol: 'NFLX', gicsSector: 'Communication Services', gicsSubCategory: 'Entertainment' },
  { companyID: generateId(), companyName: 'Alphabet Inc.', tickerSymbol: 'GOOGL', gicsSector: 'Communication Services', gicsSubCategory: 'Interactive Media & Services' },
  { companyID: generateId(), companyName: 'Amazon.com Inc.', tickerSymbol: 'AMZN', gicsSector: 'Consumer Discretionary', gicsSubCategory: 'Internet & Direct Marketing Retail' },
  { companyID: generateId(), companyName: 'Tesla Inc.', tickerSymbol: 'TSLA', gicsSector: 'Consumer Discretionary', gicsSubCategory: 'Automobiles' }
];

// Sample events with various company name formats
const sampleEvents = [
  // Microsoft events (various name formats)
  { eventID: generateId(), eventName: 'Q4 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Microsoft Corp.', startDate: '2024-01-25T09:00:00Z', endDate: '2024-01-25T10:00:00Z', location: 'Virtual Event', description: 'Quarterly earnings presentation and analyst Q&A' },
  { eventID: generateId(), eventName: 'Annual Investor Day', eventType: 'INVESTOR_MEETING', hostCompany: 'Microsoft Corp', startDate: '2024-02-15T14:00:00Z', endDate: '2024-02-15T17:00:00Z', location: 'Redmond Campus', description: 'Annual strategic overview and future roadmap' },
  { eventID: generateId(), eventName: 'AI Summit Presentation', eventType: 'CONFERENCE', hostCompany: 'Microsoft', startDate: '2024-04-05T11:00:00Z', endDate: '2024-04-05T12:00:00Z', location: 'Virtual Event', description: 'AI and cloud computing innovations' },

  // NVIDIA events (various name formats)
  { eventID: generateId(), eventName: 'GPU Technology Conference', eventType: 'CONFERENCE', hostCompany: 'NVIDIA Corp.', startDate: '2024-03-15T10:00:00Z', endDate: '2024-03-15T18:00:00Z', location: 'San Jose Convention Center', description: 'Latest GPU innovations and AI developments' },
  { eventID: generateId(), eventName: 'Q1 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'NVIDIA Corp', startDate: '2024-05-20T16:00:00Z', endDate: '2024-05-20T17:00:00Z', location: 'Virtual Event', description: 'First quarter financial results' },
  { eventID: generateId(), eventName: 'AI Developer Summit', eventType: 'CONFERENCE', hostCompany: 'NVIDIA', startDate: '2024-06-10T09:00:00Z', endDate: '2024-06-10T17:00:00Z', location: 'Santa Clara', description: 'AI development tools and platforms' },

  // Qualcomm events (various name formats)
  { eventID: generateId(), eventName: 'Mobile Technology Summit', eventType: 'CONFERENCE', hostCompany: 'Qualcomm Inc.', startDate: '2024-04-10T13:00:00Z', endDate: '2024-04-10T15:00:00Z', location: 'San Diego', description: '5G and mobile technology innovations' },
  { eventID: generateId(), eventName: 'Q2 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Qualcomm', startDate: '2024-07-25T16:00:00Z', endDate: '2024-07-25T17:00:00Z', location: 'Virtual Event', description: 'Second quarter financial results' },
  { eventID: generateId(), eventName: 'Chip Design Conference', eventType: 'CONFERENCE', hostCompany: 'Qualcomm Incorporated', startDate: '2024-08-15T10:00:00Z', endDate: '2024-08-15T16:00:00Z', location: 'Austin', description: 'Semiconductor design and manufacturing' },

  // Intel events (various name formats)
  { eventID: generateId(), eventName: 'Processor Launch Event', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Intel Corp.', startDate: '2024-05-05T14:00:00Z', endDate: '2024-05-05T16:00:00Z', location: 'Santa Clara', description: 'New processor family announcement' },
  { eventID: generateId(), eventName: 'Q3 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Intel Corp', startDate: '2024-10-15T16:00:00Z', endDate: '2024-10-15T17:00:00Z', location: 'Virtual Event', description: 'Third quarter financial results' },
  { eventID: generateId(), eventName: 'Manufacturing Day', eventType: 'ANALYST_DAY', hostCompany: 'Intel', startDate: '2024-09-20T09:00:00Z', endDate: '2024-09-20T17:00:00Z', location: 'Hillsboro', description: 'Manufacturing capabilities and roadmap' },

  // Oracle events (various name formats)
  { eventID: generateId(), eventName: 'Cloud Infrastructure Summit', eventType: 'CONFERENCE', hostCompany: 'Oracle Corp.', startDate: '2024-06-01T09:00:00Z', endDate: '2024-06-01T17:00:00Z', location: 'Las Vegas', description: 'Cloud computing and database innovations' },
  { eventID: generateId(), eventName: 'Q4 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Oracle Corp', startDate: '2024-12-15T16:00:00Z', endDate: '2024-12-15T17:00:00Z', location: 'Virtual Event', description: 'Fourth quarter financial results' },
  { eventID: generateId(), eventName: 'Database Technology Day', eventType: 'CONFERENCE', hostCompany: 'Oracle', startDate: '2024-11-10T10:00:00Z', endDate: '2024-11-10T16:00:00Z', location: 'Redwood City', description: 'Database technology and innovations' },

  // IBM events (various name formats)
  { eventID: generateId(), eventName: 'AI and Quantum Computing Summit', eventType: 'CONFERENCE', hostCompany: 'IBM Corp.', startDate: '2024-07-10T09:00:00Z', endDate: '2024-07-10T17:00:00Z', location: 'New York', description: 'AI and quantum computing developments' },
  { eventID: generateId(), eventName: 'Q2 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'IBM Corp', startDate: '2024-07-20T16:00:00Z', endDate: '2024-07-20T17:00:00Z', location: 'Virtual Event', description: 'Second quarter financial results' },
  { eventID: generateId(), eventName: 'Enterprise Solutions Day', eventType: 'ANALYST_DAY', hostCompany: 'IBM', startDate: '2024-08-25T09:00:00Z', endDate: '2024-08-25T17:00:00Z', location: 'Armonk', description: 'Enterprise software and services' },

  // Cisco events (various name formats)
  { eventID: generateId(), eventName: 'Networking Technology Conference', eventType: 'CONFERENCE', hostCompany: 'Cisco Systems', startDate: '2024-09-05T10:00:00Z', endDate: '2024-09-05T16:00:00Z', location: 'San Francisco', description: 'Networking and cybersecurity innovations' },
  { eventID: generateId(), eventName: 'Q3 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Cisco Inc.', startDate: '2024-11-15T16:00:00Z', endDate: '2024-11-15T17:00:00Z', location: 'Virtual Event', description: 'Third quarter financial results' },
  { eventID: generateId(), eventName: 'Security Summit', eventType: 'CONFERENCE', hostCompany: 'Cisco Systems Inc.', startDate: '2024-10-20T09:00:00Z', endDate: '2024-10-20T17:00:00Z', location: 'Las Vegas', description: 'Cybersecurity and threat intelligence' },

  // AMD events (various name formats)
  { eventID: generateId(), eventName: 'Processor Technology Day', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Advanced Micro Devices', startDate: '2024-06-15T14:00:00Z', endDate: '2024-06-15T16:00:00Z', location: 'Santa Clara', description: 'New processor and GPU announcements' },
  { eventID: generateId(), eventName: 'Q1 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'AMD', startDate: '2024-04-25T16:00:00Z', endDate: '2024-04-25T17:00:00Z', location: 'Virtual Event', description: 'First quarter financial results' },
  { eventID: generateId(), eventName: 'Gaming Technology Summit', eventType: 'CONFERENCE', hostCompany: 'AMD Corporation', startDate: '2024-08-30T10:00:00Z', endDate: '2024-08-30T16:00:00Z', location: 'Los Angeles', description: 'Gaming and graphics technology' },

  // Adobe events (various name formats)
  { eventID: generateId(), eventName: 'Creative Cloud Summit', eventType: 'CONFERENCE', hostCompany: 'Adobe Inc.', startDate: '2024-07-20T09:00:00Z', endDate: '2024-07-20T17:00:00Z', location: 'Las Vegas', description: 'Creative software and digital media' },
  { eventID: generateId(), eventName: 'Q2 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Adobe', startDate: '2024-06-15T16:00:00Z', endDate: '2024-06-15T17:00:00Z', location: 'Virtual Event', description: 'Second quarter financial results' },
  { eventID: generateId(), eventName: 'Digital Experience Conference', eventType: 'CONFERENCE', hostCompany: 'Adobe Systems', startDate: '2024-09-25T10:00:00Z', endDate: '2024-09-25T16:00:00Z', location: 'San Diego', description: 'Digital marketing and experience platforms' },

  // Salesforce events (various name formats)
  { eventID: generateId(), eventName: 'Dreamforce Conference', eventType: 'CONFERENCE', hostCompany: 'Salesforce Inc.', startDate: '2024-09-15T09:00:00Z', endDate: '2024-09-15T17:00:00Z', location: 'San Francisco', description: 'CRM and cloud computing innovations' },
  { eventID: generateId(), eventName: 'Q3 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Salesforce', startDate: '2024-11-25T16:00:00Z', endDate: '2024-11-25T17:00:00Z', location: 'Virtual Event', description: 'Third quarter financial results' },
  { eventID: generateId(), eventName: 'Trailhead Developer Day', eventType: 'CONFERENCE', hostCompany: 'Salesforce Corporation', startDate: '2024-10-15T10:00:00Z', endDate: '2024-10-15T16:00:00Z', location: 'Austin', description: 'Developer tools and platform updates' },

  // Meta events (various name formats)
  { eventID: generateId(), eventName: 'Connect Conference', eventType: 'CONFERENCE', hostCompany: 'Meta Platforms', startDate: '2024-10-10T09:00:00Z', endDate: '2024-10-10T17:00:00Z', location: 'Menlo Park', description: 'VR/AR and social media innovations' },
  { eventID: generateId(), eventName: 'Q4 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Facebook', startDate: '2024-01-30T16:00:00Z', endDate: '2024-01-30T17:00:00Z', location: 'Virtual Event', description: 'Fourth quarter financial results' },
  { eventID: generateId(), eventName: 'AI Research Summit', eventType: 'CONFERENCE', hostCompany: 'Meta', startDate: '2024-11-20T10:00:00Z', endDate: '2024-11-20T16:00:00Z', location: 'New York', description: 'Artificial intelligence research and applications' },

  // Netflix events (various name formats)
  { eventID: generateId(), eventName: 'Content Strategy Day', eventType: 'INVESTOR_MEETING', hostCompany: 'Netflix Inc.', startDate: '2024-08-10T14:00:00Z', endDate: '2024-08-10T16:00:00Z', location: 'Los Angeles', description: 'Content strategy and streaming innovations' },
  { eventID: generateId(), eventName: 'Q2 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Netflix', startDate: '2024-07-15T16:00:00Z', endDate: '2024-07-15T17:00:00Z', location: 'Virtual Event', description: 'Second quarter financial results' },
  { eventID: generateId(), eventName: 'Streaming Technology Conference', eventType: 'CONFERENCE', hostCompany: 'Netflix Inc.', startDate: '2024-12-05T10:00:00Z', endDate: '2024-12-05T16:00:00Z', location: 'Beverly Hills', description: 'Streaming technology and content delivery' },

  // Apple events (various name formats)
  { eventID: generateId(), eventName: 'WWDC Conference', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Apple Inc.', startDate: '2024-06-05T10:00:00Z', endDate: '2024-06-05T18:00:00Z', location: 'Cupertino', description: 'Developer conference and software announcements' },
  { eventID: generateId(), eventName: 'iPhone Launch Event', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Apple', startDate: '2024-09-10T14:00:00Z', endDate: '2024-09-10T16:00:00Z', location: 'Cupertino', description: 'New iPhone and hardware announcements' },
  { eventID: generateId(), eventName: 'Q1 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Apple Inc.', startDate: '2024-01-30T16:00:00Z', endDate: '2024-01-30T17:00:00Z', location: 'Virtual Event', description: 'First quarter financial results' },

  // Alphabet events (various name formats)
  { eventID: generateId(), eventName: 'Google I/O Conference', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Alphabet Inc.', startDate: '2024-05-15T10:00:00Z', endDate: '2024-05-15T18:00:00Z', location: 'Mountain View', description: 'Developer conference and product announcements' },
  { eventID: generateId(), eventName: 'Q3 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Google', startDate: '2024-10-25T16:00:00Z', endDate: '2024-10-25T17:00:00Z', location: 'Virtual Event', description: 'Third quarter financial results' },
  { eventID: generateId(), eventName: 'AI and Machine Learning Summit', eventType: 'CONFERENCE', hostCompany: 'Google Inc.', startDate: '2024-11-15T10:00:00Z', endDate: '2024-11-15T16:00:00Z', location: 'San Francisco', description: 'AI and machine learning innovations' },

  // Amazon events (various name formats)
  { eventID: generateId(), eventName: 'AWS re:Invent Conference', eventType: 'CONFERENCE', hostCompany: 'Amazon.com Inc.', startDate: '2024-12-01T09:00:00Z', endDate: '2024-12-01T17:00:00Z', location: 'Las Vegas', description: 'Cloud computing and AWS innovations' },
  { eventID: generateId(), eventName: 'Prime Day Briefing', eventType: 'INVESTOR_MEETING', hostCompany: 'Amazon', startDate: '2024-07-15T11:00:00Z', endDate: '2024-07-15T13:00:00Z', location: 'Virtual Event', description: 'Holiday season strategy and Prime Day results' },
  { eventID: generateId(), eventName: 'Q2 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Amazon.com Inc.', startDate: '2024-07-25T16:00:00Z', endDate: '2024-07-25T17:00:00Z', location: 'Virtual Event', description: 'Second quarter financial results' },

  // Tesla events (various name formats)
  { eventID: generateId(), eventName: 'Battery Day Event', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Tesla Inc.', startDate: '2024-09-20T18:00:00Z', endDate: '2024-09-20T20:00:00Z', location: 'Fremont Factory', description: 'Battery technology and electric vehicle innovations' },
  { eventID: generateId(), eventName: 'Q4 Earnings Call', eventType: 'EARNINGS_CALL', hostCompany: 'Tesla', startDate: '2024-01-25T16:00:00Z', endDate: '2024-01-25T17:00:00Z', location: 'Virtual Event', description: 'Fourth quarter financial results' },
  { eventID: generateId(), eventName: 'Autonomous Driving Demo', eventType: 'PRODUCT_LAUNCH', hostCompany: 'Tesla Inc.', startDate: '2024-10-15T15:00:00Z', endDate: '2024-10-15T17:00:00Z', location: 'Austin Gigafactory', description: 'Latest autopilot technology demonstration' }
];

// Company name mapping for fixing mismatches
const companyNameMapping = {
  'Microsoft Corp.': 'Microsoft Corporation',
  'Microsoft Corp': 'Microsoft Corporation',
  'Microsoft': 'Microsoft Corporation',
  'NVIDIA Corp.': 'NVIDIA Corporation',
  'NVIDIA Corp': 'NVIDIA Corporation',
  'NVIDIA': 'NVIDIA Corporation',
  'Qualcomm Inc.': 'Qualcomm Incorporated',
  'Qualcomm': 'Qualcomm Incorporated',
  'Qualcomm Incorporated': 'Qualcomm Incorporated',
  'Intel Corp.': 'Intel Corporation',
  'Intel Corp': 'Intel Corporation',
  'Intel': 'Intel Corporation',
  'Oracle Corp.': 'Oracle Corporation',
  'Oracle Corp': 'Oracle Corporation',
  'Oracle': 'Oracle Corporation',
  'IBM Corp.': 'International Business Machines Corporation',
  'IBM Corp': 'International Business Machines Corporation',
  'IBM': 'International Business Machines Corporation',
  'Cisco Systems': 'Cisco Systems Inc.',
  'Cisco Inc.': 'Cisco Systems Inc.',
  'Cisco Systems Inc.': 'Cisco Systems Inc.',
  'Advanced Micro Devices': 'Advanced Micro Devices Inc.',
  'AMD': 'Advanced Micro Devices Inc.',
  'AMD Corporation': 'Advanced Micro Devices Inc.',
  'Adobe Inc.': 'Adobe Inc.',
  'Adobe': 'Adobe Inc.',
  'Adobe Systems': 'Adobe Inc.',
  'Salesforce Inc.': 'Salesforce Inc.',
  'Salesforce': 'Salesforce Inc.',
  'Salesforce Corporation': 'Salesforce Inc.',
  'Meta Platforms': 'Meta Platforms Inc.',
  'Facebook': 'Meta Platforms Inc.',
  'Meta': 'Meta Platforms Inc.',
  'Netflix Inc.': 'Netflix Inc.',
  'Netflix': 'Netflix Inc.',
  'Apple Inc.': 'Apple Inc.',
  'Apple': 'Apple Inc.',
  'Alphabet Inc.': 'Alphabet Inc.',
  'Google': 'Alphabet Inc.',
  'Google Inc.': 'Alphabet Inc.',
  'Amazon.com Inc.': 'Amazon.com Inc.',
  'Amazon': 'Amazon.com Inc.',
  'Tesla Inc.': 'Tesla Inc.',
  'Tesla': 'Tesla Inc.'
};

async function fixCompanyNames() {
  try {
    console.log('Starting company name fix process...');

    // Step 1: Insert GICS companies
    console.log('\n1. Inserting GICS companies...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('gics_companies')
      .insert(gicsCompanies)
      .select();

    if (companiesError) {
      console.error('Error inserting companies:', companiesError);
      return;
    }
    console.log(`✅ Inserted ${companiesData.length} companies`);

    // Step 2: Insert sample events
    console.log('\n2. Inserting sample events...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();

    if (eventsError) {
      console.error('Error inserting events:', eventsError);
      return;
    }
    console.log(`✅ Inserted ${eventsData.length} events`);

    // Step 3: Fix company name mismatches
    console.log('\n3. Fixing company name mismatches...');
    
    for (const [oldName, newName] of Object.entries(companyNameMapping)) {
      const { data, error } = await supabase
        .from('events')
        .update({ hostCompany: newName, updatedAt: new Date().toISOString() })
        .eq('hostCompany', oldName);

      if (error) {
        console.error(`Error updating ${oldName} -> ${newName}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${data.length} events: "${oldName}" -> "${newName}"`);
      }
    }

    // Step 4: Verify the results
    console.log('\n4. Verifying results...');
    
    const { data: finalEvents, error: finalEventsError } = await supabase
      .from('events')
      .select('hostCompany')
      .not('hostCompany', 'is', null);

    const { data: finalCompanies, error: finalCompaniesError } = await supabase
      .from('gics_companies')
      .select('companyName');

    if (finalEventsError || finalCompaniesError) {
      console.error('Error fetching final data:', finalEventsError || finalCompaniesError);
      return;
    }

    const hostCompanies = [...new Set(finalEvents.map(e => e.hostCompany))].sort();
    const companyNames = finalCompanies.map(c => c.companyName).sort();

    console.log('\n=== FINAL RESULTS ===');
    console.log('\nHost companies in events:');
    hostCompanies.forEach(name => {
      const count = finalEvents.filter(e => e.hostCompany === name).length;
      console.log(`  "${name}" (${count} events)`);
    });

    console.log('\nCompanies in gics_companies:');
    companyNames.forEach(name => console.log(`  "${name}"`));

    // Check for mismatches
    const mismatches = hostCompanies.filter(hostName => 
      !companyNames.includes(hostName)
    );

    if (mismatches.length === 0) {
      console.log('\n✅ SUCCESS: All host company names now match gics_companies table!');
      console.log('\nExamples of fixes applied:');
      console.log('  Microsoft Corp. -> Microsoft Corporation');
      console.log('  NVIDIA Corp. -> NVIDIA Corporation');
      console.log('  Qualcomm Inc. -> Qualcomm Incorporated');
      console.log('  Intel Corp. -> Intel Corporation');
      console.log('  Oracle Corp. -> Oracle Corporation');
      console.log('  IBM Corp. -> International Business Machines Corporation');
      console.log('  Cisco Systems -> Cisco Systems Inc.');
      console.log('  Advanced Micro Devices -> Advanced Micro Devices Inc.');
      console.log('  Adobe Systems -> Adobe Inc.');
      console.log('  Salesforce Corporation -> Salesforce Inc.');
      console.log('  Meta Platforms -> Meta Platforms Inc.');
      console.log('  Facebook -> Meta Platforms Inc.');
      console.log('  Google -> Alphabet Inc.');
    } else {
      console.log('\n❌ MISMATCHES FOUND:');
      mismatches.forEach(name => console.log(`  "${name}"`));
    }

  } catch (error) {
    console.error('Process failed:', error);
  }
}

fixCompanyNames(); 