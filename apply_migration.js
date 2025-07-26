import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://mqbeopporomwnjcolnmf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmVvcHBvcm9td25qY29sbm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE3NzcsImV4cCI6MjA2ODIxNzc3N30.RbLKkK54plk5K8iflwLG8hbkB_VksuAIxsiIW25EtVM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync('supabase/migrations/20250724000000-fix-company-names-comprehensive.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`Error executing statement ${i + 1}:`, error);
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
            if (data) {
              console.log('Result:', data);
            }
          }
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('Migration completed!');
    
    // Verify the results
    console.log('\n=== VERIFICATION ===');
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('hostCompany')
      .not('hostCompany', 'is', null);

    const { data: companies, error: companiesError } = await supabase
      .from('gics_companies')
      .select('companyName');

    if (eventsError) throw eventsError;
    if (companiesError) throw companiesError;

    const hostCompanies = [...new Set(events.map(e => e.hostCompany))].sort();
    const companyNames = companies.map(c => c.companyName).sort();

    console.log('\nHost companies in events:');
    hostCompanies.forEach(name => {
      const count = events.filter(e => e.hostCompany === name).length;
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
    } else {
      console.log('\n❌ MISMATCHES FOUND:');
      mismatches.forEach(name => console.log(`  "${name}"`));
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration(); 