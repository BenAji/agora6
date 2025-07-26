-- Company Name Fix Script (Final Version)
-- This script fixes host company names in events table to match existing gics_companies table
-- Uses correct column names and avoids trigger conflicts

-- Step 1: First, let's see what companies already exist
SELECT 'EXISTING COMPANIES:' as info;
SELECT "companyName", "tickerSymbol" FROM gics_companies ORDER BY "companyName";

-- Step 2: Show current host company names before the fix
SELECT 'CURRENT HOST COMPANY NAMES:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 3: If no events exist, insert some sample events with various company name formats
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM events LIMIT 1) THEN
        -- Insert sample events with various company name formats
        INSERT INTO public.events ("eventName", "eventType", "hostCompany", "startDate", "endDate", "location", "description") VALUES
        -- Microsoft events (various name formats)
        ('Q4 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corp.', '2024-01-25 09:00:00', '2024-01-25 10:00:00', 'Virtual Event', 'Quarterly earnings presentation and analyst Q&A'),
        ('Annual Investor Day', 'INVESTOR_MEETING', 'Microsoft Corp', '2024-02-15 14:00:00', '2024-02-15 17:00:00', 'Redmond Campus', 'Annual strategic overview and future roadmap'),
        ('AI Summit Presentation', 'CONFERENCE', 'Microsoft', '2024-04-05 11:00:00', '2024-04-05 12:00:00', 'Virtual Event', 'AI and cloud computing innovations'),

        -- NVIDIA events (various name formats)
        ('GPU Technology Conference', 'CONFERENCE', 'NVIDIA Corp.', '2024-03-15 10:00:00', '2024-03-15 18:00:00', 'San Jose Convention Center', 'Latest GPU innovations and AI developments'),
        ('Q1 Earnings Call', 'EARNINGS_CALL', 'NVIDIA Corp', '2024-05-20 16:00:00', '2024-05-20 17:00:00', 'Virtual Event', 'First quarter financial results'),
        ('AI Developer Summit', 'CONFERENCE', 'NVIDIA', '2024-06-10 09:00:00', '2024-06-10 17:00:00', 'Santa Clara', 'AI development tools and platforms'),

        -- Qualcomm events (various name formats)
        ('Mobile Technology Summit', 'CONFERENCE', 'Qualcomm Inc.', '2024-04-10 13:00:00', '2024-04-10 15:00:00', 'San Diego', '5G and mobile technology innovations'),
        ('Q2 Earnings Call', 'EARNINGS_CALL', 'Qualcomm', '2024-07-25 16:00:00', '2024-07-25 17:00:00', 'Virtual Event', 'Second quarter financial results'),
        ('Chip Design Conference', 'CONFERENCE', 'Qualcomm Corp.', '2024-08-15 10:00:00', '2024-08-15 16:00:00', 'Austin', 'Semiconductor design and manufacturing'),

        -- Intel events (various name formats)
        ('Processor Launch Event', 'PRODUCT_LAUNCH', 'Intel Corp.', '2024-05-05 14:00:00', '2024-05-05 16:00:00', 'Santa Clara', 'New processor family announcement'),
        ('Q3 Earnings Call', 'EARNINGS_CALL', 'Intel Corp', '2024-10-15 16:00:00', '2024-10-15 17:00:00', 'Virtual Event', 'Third quarter financial results'),
        ('Manufacturing Day', 'ANALYST_DAY', 'Intel', '2024-09-20 09:00:00', '2024-09-20 17:00:00', 'Hillsboro', 'Manufacturing capabilities and roadmap'),

        -- Oracle events (various name formats)
        ('Cloud Infrastructure Summit', 'CONFERENCE', 'Oracle Corp.', '2024-06-01 09:00:00', '2024-06-01 17:00:00', 'Las Vegas', 'Cloud computing and database innovations'),
        ('Q4 Earnings Call', 'EARNINGS_CALL', 'Oracle Corp', '2024-12-15 16:00:00', '2024-12-15 17:00:00', 'Virtual Event', 'Fourth quarter financial results'),
        ('Database Technology Day', 'CONFERENCE', 'Oracle', '2024-11-10 10:00:00', '2024-11-10 16:00:00', 'Redwood City', 'Database technology and innovations'),

        -- Apple events (various name formats)
        ('WWDC Conference', 'PRODUCT_LAUNCH', 'Apple Inc.', '2024-06-05 10:00:00', '2024-06-05 18:00:00', 'Cupertino', 'Developer conference and software announcements'),
        ('iPhone Launch Event', 'PRODUCT_LAUNCH', 'Apple', '2024-09-10 14:00:00', '2024-09-10 16:00:00', 'Cupertino', 'New iPhone and hardware announcements'),

        -- Amazon events (various name formats)
        ('AWS re:Invent Conference', 'CONFERENCE', 'Amazon.com Inc.', '2024-12-01 09:00:00', '2024-12-01 17:00:00', 'Las Vegas', 'Cloud computing and AWS innovations'),
        ('Prime Day Briefing', 'INVESTOR_MEETING', 'Amazon', '2024-07-15 11:00:00', '2024-07-15 13:00:00', 'Virtual Event', 'Holiday season strategy and Prime Day results'),

        -- Tesla events (various name formats)
        ('Battery Day Event', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2024-09-20 18:00:00', '2024-09-20 20:00:00', 'Fremont Factory', 'Battery technology and electric vehicle innovations'),
        ('Q4 Earnings Call', 'EARNINGS_CALL', 'Tesla', '2024-01-25 16:00:00', '2024-01-25 17:00:00', 'Virtual Event', 'Fourth quarter financial results');
        
        RAISE NOTICE 'Sample events inserted successfully';
    ELSE
        RAISE NOTICE 'Events table already has data, skipping sample event insertion';
    END IF;
END $$;

-- Step 4: Show current host company names after potential sample insertion
SELECT 'HOST COMPANY NAMES TO FIX:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 5: Update host company names directly using individual UPDATE statements
-- This approach avoids trigger conflicts and uses the correct column names

-- Microsoft variations
UPDATE events 
SET "hostCompany" = 'Microsoft Corporation'
WHERE "hostCompany" IN ('Microsoft Corp.', 'Microsoft Corp', 'Microsoft')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'MSFT');

-- NVIDIA variations
UPDATE events 
SET "hostCompany" = 'NVIDIA Corporation'
WHERE "hostCompany" IN ('NVIDIA Corp.', 'NVIDIA Corp', 'NVIDIA')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'NVDA');

-- Qualcomm variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'QCOM' LIMIT 1)
WHERE "hostCompany" IN ('Qualcomm Inc.', 'Qualcomm Corp.', 'Qualcomm Corp', 'Qualcomm')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'QCOM');

-- Intel variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'INTC' LIMIT 1)
WHERE "hostCompany" IN ('Intel Corp.', 'Intel Corp', 'Intel')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'INTC');

-- Oracle variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ORCL' LIMIT 1)
WHERE "hostCompany" IN ('Oracle Corp.', 'Oracle Corp', 'Oracle')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'ORCL');

-- IBM variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'IBM' LIMIT 1)
WHERE "hostCompany" IN ('IBM Corp.', 'IBM Corp', 'IBM')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'IBM');

-- Cisco variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'CSCO' LIMIT 1)
WHERE "hostCompany" IN ('Cisco Systems', 'Cisco Inc.', 'Cisco Systems Inc.', 'Cisco')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'CSCO');

-- AMD variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMD' LIMIT 1)
WHERE "hostCompany" IN ('Advanced Micro Devices', 'AMD Corporation', 'AMD')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'AMD');

-- Adobe variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ADBE' LIMIT 1)
WHERE "hostCompany" IN ('Adobe Systems', 'Adobe Inc.', 'Adobe')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'ADBE');

-- Salesforce variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'CRM' LIMIT 1)
WHERE "hostCompany" IN ('Salesforce Corporation', 'Salesforce Inc.', 'Salesforce')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'CRM');

-- Meta variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'META' LIMIT 1)
WHERE "hostCompany" IN ('Meta Platforms', 'Facebook', 'Meta')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'META');

-- Netflix variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'NFLX' LIMIT 1)
WHERE "hostCompany" IN ('Netflix Inc.', 'Netflix')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'NFLX');

-- Apple variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AAPL' LIMIT 1)
WHERE "hostCompany" IN ('Apple Inc.', 'Apple')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'AAPL');

-- Alphabet/Google variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'GOOGL' LIMIT 1)
WHERE "hostCompany" IN ('Google', 'Google Inc.', 'Alphabet Inc.')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'GOOGL');

-- Amazon variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMZN' LIMIT 1)
WHERE "hostCompany" IN ('Amazon.com Inc.', 'Amazon')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'AMZN');

-- Tesla variations
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'TSLA' LIMIT 1)
WHERE "hostCompany" IN ('Tesla Inc.', 'Tesla')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'TSLA');

-- Step 6: Show the results after the fix
SELECT 'UPDATED HOST COMPANY NAMES:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 7: Verify that host company names match gics_companies table
SELECT 'VERIFICATION RESULTS:' as info;
SELECT 
  e."hostCompany" as event_host_company,
  g."companyName" as gics_company_name,
  g."tickerSymbol" as ticker,
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

-- Step 8: Show summary of changes
SELECT 'SUMMARY:' as info;
SELECT 
  COUNT(*) as total_events,
  COUNT(DISTINCT "hostCompany") as unique_companies,
  COUNT(CASE WHEN "hostCompany" IN (SELECT "companyName" FROM gics_companies) THEN 1 END) as matching_companies,
  COUNT(CASE WHEN "hostCompany" NOT IN (SELECT "companyName" FROM gics_companies) THEN 1 END) as non_matching_companies
FROM events 
WHERE "hostCompany" IS NOT NULL; 