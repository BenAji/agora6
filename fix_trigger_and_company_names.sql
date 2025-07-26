-- Fix Trigger Function and Company Names Script
-- This script first fixes the trigger function to use correct column names, then updates company names

-- Step 1: Fix the trigger function to use camelCase column names
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 2: Show existing companies
SELECT 'EXISTING COMPANIES:' as info;
SELECT "companyName", "tickerSymbol" FROM gics_companies ORDER BY "companyName";

-- Step 3: Show current host company names
SELECT 'CURRENT HOST COMPANY NAMES:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 4: If no events exist, insert some sample events
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM events LIMIT 1) THEN
        INSERT INTO public.events ("eventName", "eventType", "hostCompany", "startDate", "endDate", "location", "description") VALUES
        -- Microsoft variations
        ('Q4 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corp.', '2024-01-25 09:00:00', '2024-01-25 10:00:00', 'Virtual Event', 'Quarterly earnings presentation'),
        ('Annual Investor Day', 'INVESTOR_MEETING', 'Microsoft Corp', '2024-02-15 14:00:00', '2024-02-15 17:00:00', 'Redmond Campus', 'Annual strategic overview'),
        ('AI Summit', 'CONFERENCE', 'Microsoft', '2024-04-05 11:00:00', '2024-04-05 12:00:00', 'Virtual Event', 'AI innovations'),
        
        -- NVIDIA variations
        ('GPU Conference', 'CONFERENCE', 'NVIDIA Corp.', '2024-03-15 10:00:00', '2024-03-15 18:00:00', 'San Jose', 'GPU innovations'),
        ('Q1 Earnings', 'EARNINGS_CALL', 'NVIDIA Corp', '2024-05-20 16:00:00', '2024-05-20 17:00:00', 'Virtual Event', 'First quarter results'),
        ('AI Summit', 'CONFERENCE', 'NVIDIA', '2024-06-10 09:00:00', '2024-06-10 17:00:00', 'Santa Clara', 'AI development'),
        
        -- Qualcomm variations
        ('Mobile Summit', 'CONFERENCE', 'Qualcomm Inc.', '2024-04-10 13:00:00', '2024-04-10 15:00:00', 'San Diego', '5G innovations'),
        ('Q2 Earnings', 'EARNINGS_CALL', 'Qualcomm', '2024-07-25 16:00:00', '2024-07-25 17:00:00', 'Virtual Event', 'Second quarter results'),
        ('Chip Conference', 'CONFERENCE', 'Qualcomm Corp.', '2024-08-15 10:00:00', '2024-08-15 16:00:00', 'Austin', 'Semiconductor design'),
        
        -- Intel variations
        ('Processor Launch', 'PRODUCT_LAUNCH', 'Intel Corp.', '2024-05-05 14:00:00', '2024-05-05 16:00:00', 'Santa Clara', 'New processor announcement'),
        ('Q3 Earnings', 'EARNINGS_CALL', 'Intel Corp', '2024-10-15 16:00:00', '2024-10-15 17:00:00', 'Virtual Event', 'Third quarter results'),
        ('Manufacturing Day', 'ANALYST_DAY', 'Intel', '2024-09-20 09:00:00', '2024-09-20 17:00:00', 'Hillsboro', 'Manufacturing capabilities'),
        
        -- Apple variations
        ('WWDC', 'PRODUCT_LAUNCH', 'Apple Inc.', '2024-06-05 10:00:00', '2024-06-05 18:00:00', 'Cupertino', 'Developer conference'),
        ('iPhone Launch', 'PRODUCT_LAUNCH', 'Apple', '2024-09-10 14:00:00', '2024-09-10 16:00:00', 'Cupertino', 'New iPhone announcement'),
        
        -- Amazon variations
        ('AWS re:Invent', 'CONFERENCE', 'Amazon.com Inc.', '2024-12-01 09:00:00', '2024-12-01 17:00:00', 'Las Vegas', 'Cloud innovations'),
        ('Prime Day Brief', 'INVESTOR_MEETING', 'Amazon', '2024-07-15 11:00:00', '2024-07-15 13:00:00', 'Virtual Event', 'Prime Day strategy'),
        
        -- Tesla variations
        ('Battery Day', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2024-09-20 18:00:00', '2024-09-20 20:00:00', 'Fremont Factory', 'Battery technology'),
        ('Q4 Earnings', 'EARNINGS_CALL', 'Tesla', '2024-01-25 16:00:00', '2024-01-25 17:00:00', 'Virtual Event', 'Fourth quarter results');
        
        RAISE NOTICE 'Sample events inserted successfully';
    ELSE
        RAISE NOTICE 'Events table already has data, skipping sample insertion';
    END IF;
END $$;

-- Step 5: Show company names that need fixing
SELECT 'COMPANY NAMES TO FIX:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 6: Update company names one by one (this will now work with the fixed trigger)

-- Microsoft variations → Microsoft Corporation
UPDATE events 
SET "hostCompany" = 'Microsoft Corporation'
WHERE "hostCompany" IN ('Microsoft Corp.', 'Microsoft Corp', 'Microsoft')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'MSFT' AND "companyName" = 'Microsoft Corporation');

-- NVIDIA variations → NVIDIA Corporation  
UPDATE events 
SET "hostCompany" = 'NVIDIA Corporation'
WHERE "hostCompany" IN ('NVIDIA Corp.', 'NVIDIA Corp', 'NVIDIA')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'NVDA' AND "companyName" = 'NVIDIA Corporation');

-- Qualcomm variations → Use actual company name from gics_companies
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'QCOM' LIMIT 1)
WHERE "hostCompany" IN ('Qualcomm Inc.', 'Qualcomm Corp.', 'Qualcomm Corp', 'Qualcomm')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'QCOM');

-- Intel variations → Use actual company name from gics_companies
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'INTC' LIMIT 1)
WHERE "hostCompany" IN ('Intel Corp.', 'Intel Corp', 'Intel')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'INTC');

-- Oracle variations → Use actual company name from gics_companies
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'ORCL' LIMIT 1)
WHERE "hostCompany" IN ('Oracle Corp.', 'Oracle Corp', 'Oracle')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'ORCL');

-- Apple variations → Use actual company name from gics_companies
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AAPL' LIMIT 1)
WHERE "hostCompany" IN ('Apple Inc.', 'Apple')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'AAPL');

-- Amazon variations → Use actual company name from gics_companies
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'AMZN' LIMIT 1)
WHERE "hostCompany" IN ('Amazon.com Inc.', 'Amazon')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'AMZN');

-- Tesla variations → Use actual company name from gics_companies
UPDATE events 
SET "hostCompany" = (SELECT "companyName" FROM gics_companies WHERE "tickerSymbol" = 'TSLA' LIMIT 1)
WHERE "hostCompany" IN ('Tesla Inc.', 'Tesla')
  AND EXISTS (SELECT 1 FROM gics_companies WHERE "tickerSymbol" = 'TSLA');

-- Add more company fixes as needed...
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

-- Step 7: Show results after the fix
SELECT 'UPDATED HOST COMPANY NAMES:' as info;
SELECT "hostCompany", COUNT(*) as event_count 
FROM events 
WHERE "hostCompany" IS NOT NULL 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 8: Verify that host company names match gics_companies
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

-- Step 9: Summary
SELECT 'FINAL SUMMARY:' as info;
SELECT 
  COUNT(*) as total_events,
  COUNT(DISTINCT "hostCompany") as unique_companies,
  COUNT(CASE WHEN "hostCompany" IN (SELECT "companyName" FROM gics_companies) THEN 1 END) as matching_companies,
  COUNT(CASE WHEN "hostCompany" NOT IN (SELECT "companyName" FROM gics_companies) THEN 1 END) as non_matching_companies,
  ROUND(
    (COUNT(CASE WHEN "hostCompany" IN (SELECT "companyName" FROM gics_companies) THEN 1 END) * 100.0) / COUNT(*), 
    2
  ) as match_percentage
FROM events 
WHERE "hostCompany" IS NOT NULL; 