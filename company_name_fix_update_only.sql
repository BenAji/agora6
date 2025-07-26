-- Company Name Fix Script (Update Only)
-- This script fixes host company names in events table to match existing gics_companies table
-- Run this in your Supabase SQL Editor

-- Step 1: First, let's see what companies already exist
SELECT 'EXISTING COMPANIES:' as info;
SELECT "companyName", "tickerSymbol" FROM gics_companies ORDER BY "companyName";

-- Step 2: Insert sample events with various company name formats (only if events table is empty)
-- Check if events table is empty first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM events LIMIT 1) THEN
        -- Insert sample events with various company name formats
        INSERT INTO public.events ("eventID", "eventName", "eventType", "hostCompany", "startDate", "endDate", "location", "description", "createdAt", "updatedAt") VALUES
        -- Microsoft events (various name formats)
        (gen_random_uuid(), 'Q4 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corp.', '2024-01-25 09:00:00', '2024-01-25 10:00:00', 'Virtual Event', 'Quarterly earnings presentation and analyst Q&A', now(), now()),
        (gen_random_uuid(), 'Annual Investor Day', 'INVESTOR_MEETING', 'Microsoft Corp', '2024-02-15 14:00:00', '2024-02-15 17:00:00', 'Redmond Campus', 'Annual strategic overview and future roadmap', now(), now()),
        (gen_random_uuid(), 'AI Summit Presentation', 'CONFERENCE', 'Microsoft', '2024-04-05 11:00:00', '2024-04-05 12:00:00', 'Virtual Event', 'AI and cloud computing innovations', now(), now()),

        -- NVIDIA events (various name formats)
        (gen_random_uuid(), 'GPU Technology Conference', 'CONFERENCE', 'NVIDIA Corp.', '2024-03-15 10:00:00', '2024-03-15 18:00:00', 'San Jose Convention Center', 'Latest GPU innovations and AI developments', now(), now()),
        (gen_random_uuid(), 'Q1 Earnings Call', 'EARNINGS_CALL', 'NVIDIA Corp', '2024-05-20 16:00:00', '2024-05-20 17:00:00', 'Virtual Event', 'First quarter financial results', now(), now()),
        (gen_random_uuid(), 'AI Developer Summit', 'CONFERENCE', 'NVIDIA', '2024-06-10 09:00:00', '2024-06-10 17:00:00', 'Santa Clara', 'AI development tools and platforms', now(), now()),

        -- Qualcomm events (various name formats)
        (gen_random_uuid(), 'Mobile Technology Summit', 'CONFERENCE', 'Qualcomm Inc.', '2024-04-10 13:00:00', '2024-04-10 15:00:00', 'San Diego', '5G and mobile technology innovations', now(), now()),
        (gen_random_uuid(), 'Q2 Earnings Call', 'EARNINGS_CALL', 'Qualcomm', '2024-07-25 16:00:00', '2024-07-25 17:00:00', 'Virtual Event', 'Second quarter financial results', now(), now()),
        (gen_random_uuid(), 'Chip Design Conference', 'CONFERENCE', 'Qualcomm Incorporated', '2024-08-15 10:00:00', '2024-08-15 16:00:00', 'Austin', 'Semiconductor design and manufacturing', now(), now()),

        -- Intel events (various name formats)
        (gen_random_uuid(), 'Processor Launch Event', 'PRODUCT_LAUNCH', 'Intel Corp.', '2024-05-05 14:00:00', '2024-05-05 16:00:00', 'Santa Clara', 'New processor family announcement', now(), now()),
        (gen_random_uuid(), 'Q3 Earnings Call', 'EARNINGS_CALL', 'Intel Corp', '2024-10-15 16:00:00', '2024-10-15 17:00:00', 'Virtual Event', 'Third quarter financial results', now(), now()),
        (gen_random_uuid(), 'Manufacturing Day', 'ANALYST_DAY', 'Intel', '2024-09-20 09:00:00', '2024-09-20 17:00:00', 'Hillsboro', 'Manufacturing capabilities and roadmap', now(), now()),

        -- Oracle events (various name formats)
        (gen_random_uuid(), 'Cloud Infrastructure Summit', 'CONFERENCE', 'Oracle Corp.', '2024-06-01 09:00:00', '2024-06-01 17:00:00', 'Las Vegas', 'Cloud computing and database innovations', now(), now()),
        (gen_random_uuid(), 'Q4 Earnings Call', 'EARNINGS_CALL', 'Oracle Corp', '2024-12-15 16:00:00', '2024-12-15 17:00:00', 'Virtual Event', 'Fourth quarter financial results', now(), now()),
        (gen_random_uuid(), 'Database Technology Day', 'CONFERENCE', 'Oracle', '2024-11-10 10:00:00', '2024-11-10 16:00:00', 'Redwood City', 'Database technology and innovations', now(), now()),

        -- IBM events (various name formats)
        (gen_random_uuid(), 'AI and Quantum Computing Summit', 'CONFERENCE', 'IBM Corp.', '2024-07-10 09:00:00', '2024-07-10 17:00:00', 'New York', 'AI and quantum computing developments', now(), now()),
        (gen_random_uuid(), 'Q2 Earnings Call', 'EARNINGS_CALL', 'IBM Corp', '2024-07-20 16:00:00', '2024-07-20 17:00:00', 'Virtual Event', 'Second quarter financial results', now(), now()),
        (gen_random_uuid(), 'Enterprise Solutions Day', 'ANALYST_DAY', 'IBM', '2024-08-25 09:00:00', '2024-08-25 17:00:00', 'Armonk', 'Enterprise software and services', now(), now()),

        -- Cisco events (various name formats)
        (gen_random_uuid(), 'Networking Technology Conference', 'CONFERENCE', 'Cisco Systems', '2024-09-05 10:00:00', '2024-09-05 16:00:00', 'San Francisco', 'Networking and cybersecurity innovations', now(), now()),
        (gen_random_uuid(), 'Q3 Earnings Call', 'EARNINGS_CALL', 'Cisco Inc.', '2024-11-15 16:00:00', '2024-11-15 17:00:00', 'Virtual Event', 'Third quarter financial results', now(), now()),
        (gen_random_uuid(), 'Security Summit', 'CONFERENCE', 'Cisco Systems Inc.', '2024-10-20 09:00:00', '2024-10-20 17:00:00', 'Las Vegas', 'Cybersecurity and threat intelligence', now(), now()),

        -- AMD events (various name formats)
        (gen_random_uuid(), 'Processor Technology Day', 'PRODUCT_LAUNCH', 'Advanced Micro Devices', '2024-06-15 14:00:00', '2024-06-15 16:00:00', 'Santa Clara', 'New processor and GPU announcements', now(), now()),
        (gen_random_uuid(), 'Q1 Earnings Call', 'EARNINGS_CALL', 'AMD', '2024-04-25 16:00:00', '2024-04-25 17:00:00', 'Virtual Event', 'First quarter financial results', now(), now()),
        (gen_random_uuid(), 'Gaming Technology Summit', 'CONFERENCE', 'AMD Corporation', '2024-08-30 10:00:00', '2024-08-30 16:00:00', 'Los Angeles', 'Gaming and graphics technology', now(), now()),

        -- Adobe events (various name formats)
        (gen_random_uuid(), 'Creative Cloud Summit', 'CONFERENCE', 'Adobe Inc.', '2024-07-20 09:00:00', '2024-07-20 17:00:00', 'Las Vegas', 'Creative software and digital media', now(), now()),
        (gen_random_uuid(), 'Q2 Earnings Call', 'EARNINGS_CALL', 'Adobe', '2024-06-15 16:00:00', '2024-06-15 17:00:00', 'Virtual Event', 'Second quarter financial results', now(), now()),
        (gen_random_uuid(), 'Digital Experience Conference', 'CONFERENCE', 'Adobe Systems', '2024-09-25 10:00:00', '2024-09-25 16:00:00', 'San Diego', 'Digital marketing and experience platforms', now(), now()),

        -- Salesforce events (various name formats)
        (gen_random_uuid(), 'Dreamforce Conference', 'CONFERENCE', 'Salesforce Inc.', '2024-09-15 09:00:00', '2024-09-15 17:00:00', 'San Francisco', 'CRM and cloud computing innovations', now(), now()),
        (gen_random_uuid(), 'Q3 Earnings Call', 'EARNINGS_CALL', 'Salesforce', '2024-11-25 16:00:00', '2024-11-25 17:00:00', 'Virtual Event', 'Third quarter financial results', now(), now()),
        (gen_random_uuid(), 'Trailhead Developer Day', 'CONFERENCE', 'Salesforce Corporation', '2024-10-15 10:00:00', '2024-10-15 16:00:00', 'Austin', 'Developer tools and platform updates', now(), now()),

        -- Meta events (various name formats)
        (gen_random_uuid(), 'Connect Conference', 'CONFERENCE', 'Meta Platforms', '2024-10-10 09:00:00', '2024-10-10 17:00:00', 'Menlo Park', 'VR/AR and social media innovations', now(), now()),
        (gen_random_uuid(), 'Q4 Earnings Call', 'EARNINGS_CALL', 'Facebook', '2024-01-30 16:00:00', '2024-01-30 17:00:00', 'Virtual Event', 'Fourth quarter financial results', now(), now()),
        (gen_random_uuid(), 'AI Research Summit', 'CONFERENCE', 'Meta', '2024-11-20 10:00:00', '2024-11-20 16:00:00', 'New York', 'Artificial intelligence research and applications', now(), now()),

        -- Netflix events (various name formats)
        (gen_random_uuid(), 'Content Strategy Day', 'INVESTOR_MEETING', 'Netflix Inc.', '2024-08-10 14:00:00', '2024-08-10 16:00:00', 'Los Angeles', 'Content strategy and streaming innovations', now(), now()),
        (gen_random_uuid(), 'Q2 Earnings Call', 'EARNINGS_CALL', 'Netflix', '2024-07-15 16:00:00', '2024-07-15 17:00:00', 'Virtual Event', 'Second quarter financial results', now(), now()),
        (gen_random_uuid(), 'Streaming Technology Conference', 'CONFERENCE', 'Netflix Inc.', '2024-12-05 10:00:00', '2024-12-05 16:00:00', 'Beverly Hills', 'Streaming technology and content delivery', now(), now()),

        -- Apple events (various name formats)
        (gen_random_uuid(), 'WWDC Conference', 'PRODUCT_LAUNCH', 'Apple Inc.', '2024-06-05 10:00:00', '2024-06-05 18:00:00', 'Cupertino', 'Developer conference and software announcements', now(), now()),
        (gen_random_uuid(), 'iPhone Launch Event', 'PRODUCT_LAUNCH', 'Apple', '2024-09-10 14:00:00', '2024-09-10 16:00:00', 'Cupertino', 'New iPhone and hardware announcements', now(), now()),
        (gen_random_uuid(), 'Q1 Earnings Call', 'EARNINGS_CALL', 'Apple Inc.', '2024-01-30 16:00:00', '2024-01-30 17:00:00', 'Virtual Event', 'First quarter financial results', now(), now()),

        -- Alphabet events (various name formats)
        (gen_random_uuid(), 'Google I/O Conference', 'PRODUCT_LAUNCH', 'Alphabet Inc.', '2024-05-15 10:00:00', '2024-05-15 18:00:00', 'Mountain View', 'Developer conference and product announcements', now(), now()),
        (gen_random_uuid(), 'Q3 Earnings Call', 'EARNINGS_CALL', 'Google', '2024-10-25 16:00:00', '2024-10-25 17:00:00', 'Virtual Event', 'Third quarter financial results', now(), now()),
        (gen_random_uuid(), 'AI and Machine Learning Summit', 'CONFERENCE', 'Google Inc.', '2024-11-15 10:00:00', '2024-11-15 16:00:00', 'San Francisco', 'AI and machine learning innovations', now(), now()),

        -- Amazon events (various name formats)
        (gen_random_uuid(), 'AWS re:Invent Conference', 'CONFERENCE', 'Amazon.com Inc.', '2024-12-01 09:00:00', '2024-12-01 17:00:00', 'Las Vegas', 'Cloud computing and AWS innovations', now(), now()),
        (gen_random_uuid(), 'Prime Day Briefing', 'INVESTOR_MEETING', 'Amazon', '2024-07-15 11:00:00', '2024-07-15 13:00:00', 'Virtual Event', 'Holiday season strategy and Prime Day results', now(), now()),
        (gen_random_uuid(), 'Q2 Earnings Call', 'EARNINGS_CALL', 'Amazon.com Inc.', '2024-07-25 16:00:00', '2024-07-25 17:00:00', 'Virtual Event', 'Second quarter financial results', now(), now()),

        -- Tesla events (various name formats)
        (gen_random_uuid(), 'Battery Day Event', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2024-09-20 18:00:00', '2024-09-20 20:00:00', 'Fremont Factory', 'Battery technology and electric vehicle innovations', now(), now()),
        (gen_random_uuid(), 'Q4 Earnings Call', 'EARNINGS_CALL', 'Tesla', '2024-01-25 16:00:00', '2024-01-25 17:00:00', 'Virtual Event', 'Fourth quarter financial results', now(), now()),
        (gen_random_uuid(), 'Autonomous Driving Demo', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2024-10-15 15:00:00', '2024-10-15 17:00:00', 'Austin Gigafactory', 'Latest autopilot technology demonstration', now(), now());
        
        RAISE NOTICE 'Sample events inserted successfully';
    ELSE
        RAISE NOTICE 'Events table already has data, skipping sample event insertion';
    END IF;
END $$;

-- Step 3: Show current host company names before the fix
SELECT 'CURRENT HOST COMPANY NAMES:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 4: Create a mapping table based on existing gics_companies
-- This will map common variations to the actual company names in gics_companies
CREATE TEMP TABLE company_name_mapping AS
SELECT 
    'Microsoft Corp.' as old_name, "companyName" as new_name
FROM gics_companies WHERE "tickerSymbol" = 'MSFT'
UNION ALL
SELECT 'Microsoft Corp', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'MSFT'
UNION ALL
SELECT 'Microsoft', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'MSFT'
UNION ALL
SELECT 'NVIDIA Corp.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'NVDA'
UNION ALL
SELECT 'NVIDIA Corp', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'NVDA'
UNION ALL
SELECT 'NVIDIA', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'NVDA'
UNION ALL
SELECT 'Qualcomm Inc.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'QCOM'
UNION ALL
SELECT 'Qualcomm', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'QCOM'
UNION ALL
SELECT 'Intel Corp.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'INTC'
UNION ALL
SELECT 'Intel Corp', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'INTC'
UNION ALL
SELECT 'Intel', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'INTC'
UNION ALL
SELECT 'Oracle Corp.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ORCL'
UNION ALL
SELECT 'Oracle Corp', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ORCL'
UNION ALL
SELECT 'Oracle', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ORCL'
UNION ALL
SELECT 'IBM Corp.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'IBM'
UNION ALL
SELECT 'IBM Corp', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'IBM'
UNION ALL
SELECT 'IBM', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'IBM'
UNION ALL
SELECT 'Cisco Systems', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'CSCO'
UNION ALL
SELECT 'Cisco Inc.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'CSCO'
UNION ALL
SELECT 'Advanced Micro Devices', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMD'
UNION ALL
SELECT 'AMD', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMD'
UNION ALL
SELECT 'AMD Corporation', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMD'
UNION ALL
SELECT 'Adobe Systems', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ADBE'
UNION ALL
SELECT 'Adobe', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ADBE'
UNION ALL
SELECT 'Salesforce Corporation', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'CRM'
UNION ALL
SELECT 'Salesforce', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'CRM'
UNION ALL
SELECT 'Meta Platforms', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'META'
UNION ALL
SELECT 'Facebook', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'META'
UNION ALL
SELECT 'Meta', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'META'
UNION ALL
SELECT 'Netflix', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'NFLX'
UNION ALL
SELECT 'Apple', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AAPL'
UNION ALL
SELECT 'Google', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'GOOGL'
UNION ALL
SELECT 'Google Inc.', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'GOOGL'
UNION ALL
SELECT 'Amazon', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMZN'
UNION ALL
SELECT 'Tesla', "companyName" FROM gics_companies WHERE "tickerSymbol" = 'TSLA';

-- Step 5: Show the mapping that will be applied
SELECT 'COMPANY NAME MAPPING:' as info;
SELECT old_name, new_name FROM company_name_mapping ORDER BY new_name, old_name;

-- Step 6: Update events using the mapping table
UPDATE events 
SET "hostCompany" = mapping.new_name,
    "updatedAt" = now()
FROM company_name_mapping mapping
WHERE events."hostCompany" = mapping.old_name;

-- Step 7: Show the results after the fix
SELECT 'UPDATED HOST COMPANY NAMES:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 8: Verify that all host company names now match gics_companies table
SELECT 'VERIFICATION RESULTS:' as info;
SELECT 
  e."hostCompany" as event_host_company,
  g."companyName" as gics_company_name,
  CASE 
    WHEN e."hostCompany" = g."companyName" THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM (
  SELECT DISTINCT "hostCompany" 
  FROM events 
  WHERE "hostCompany" IS NOT NULL
) e
LEFT JOIN gics_companies g ON e."hostCompany" = g."companyName"
ORDER BY e."hostCompany";

-- Step 9: Show summary of changes
SELECT 'SUMMARY:' as info;
SELECT 
  COUNT(*) as total_events,
  COUNT(DISTINCT "hostCompany") as unique_companies,
  COUNT(CASE WHEN "hostCompany" IN (SELECT "companyName" FROM gics_companies) THEN 1 END) as matching_companies
FROM events 
WHERE "hostCompany" IS NOT NULL; 