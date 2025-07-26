-- Company Name Fix Script for Supabase
-- This script fixes host company names in events table to match gics_companies table
-- Run this in your Supabase SQL Editor

-- Step 1: Insert sample GICS companies with proper names
INSERT INTO public.gics_companies ("companyID", "companyName", "tickerSymbol", "gicsSector", "gicsSubCategory", "createdAt", "updatedAt") VALUES
-- Technology companies
(gen_random_uuid(), 'Microsoft Corporation', 'MSFT', 'Information Technology', 'Software', now(), now()),
(gen_random_uuid(), 'Apple Inc.', 'AAPL', 'Information Technology', 'Technology Hardware, Storage & Peripherals', now(), now()),
(gen_random_uuid(), 'NVIDIA Corporation', 'NVDA', 'Information Technology', 'Semiconductors & Semiconductor Equipment', now(), now()),
(gen_random_uuid(), 'Intel Corporation', 'INTC', 'Information Technology', 'Semiconductors & Semiconductor Equipment', now(), now()),
(gen_random_uuid(), 'Qualcomm Incorporated', 'QCOM', 'Information Technology', 'Semiconductors & Semiconductor Equipment', now(), now()),
(gen_random_uuid(), 'Oracle Corporation', 'ORCL', 'Information Technology', 'Software', now(), now()),
(gen_random_uuid(), 'Cisco Systems Inc.', 'CSCO', 'Information Technology', 'Communications Equipment', now(), now()),
(gen_random_uuid(), 'International Business Machines Corporation', 'IBM', 'Information Technology', 'IT Services', now(), now()),
(gen_random_uuid(), 'Advanced Micro Devices Inc.', 'AMD', 'Information Technology', 'Semiconductors & Semiconductor Equipment', now(), now()),
(gen_random_uuid(), 'Adobe Inc.', 'ADBE', 'Information Technology', 'Software', now(), now()),
(gen_random_uuid(), 'Salesforce Inc.', 'CRM', 'Information Technology', 'Software', now(), now()),
(gen_random_uuid(), 'Meta Platforms Inc.', 'META', 'Communication Services', 'Interactive Media & Services', now(), now()),
(gen_random_uuid(), 'Netflix Inc.', 'NFLX', 'Communication Services', 'Entertainment', now(), now()),
(gen_random_uuid(), 'Alphabet Inc.', 'GOOGL', 'Communication Services', 'Interactive Media & Services', now(), now()),
(gen_random_uuid(), 'Amazon.com Inc.', 'AMZN', 'Consumer Discretionary', 'Internet & Direct Marketing Retail', now(), now()),
(gen_random_uuid(), 'Tesla Inc.', 'TSLA', 'Consumer Discretionary', 'Automobiles', now(), now());

-- Step 2: Insert sample events with various company name formats
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

-- Step 3: Fix company name mismatches by updating events to use the correct company names from gics_companies
UPDATE events 
SET "hostCompany" = CASE 
  -- Microsoft variations
  WHEN "hostCompany" = 'Microsoft Corp.' THEN 'Microsoft Corporation'
  WHEN "hostCompany" = 'Microsoft Corp' THEN 'Microsoft Corporation'
  WHEN "hostCompany" = 'Microsoft' THEN 'Microsoft Corporation'
  
  -- NVIDIA variations
  WHEN "hostCompany" = 'NVIDIA Corp.' THEN 'NVIDIA Corporation'
  WHEN "hostCompany" = 'NVIDIA Corp' THEN 'NVIDIA Corporation'
  WHEN "hostCompany" = 'NVIDIA' THEN 'NVIDIA Corporation'
  
  -- Qualcomm variations
  WHEN "hostCompany" = 'Qualcomm Inc.' THEN 'Qualcomm Incorporated'
  WHEN "hostCompany" = 'Qualcomm' THEN 'Qualcomm Incorporated'
  WHEN "hostCompany" = 'Qualcomm Incorporated' THEN 'Qualcomm Incorporated'
  
  -- Intel variations
  WHEN "hostCompany" = 'Intel Corp.' THEN 'Intel Corporation'
  WHEN "hostCompany" = 'Intel Corp' THEN 'Intel Corporation'
  WHEN "hostCompany" = 'Intel' THEN 'Intel Corporation'
  
  -- Oracle variations
  WHEN "hostCompany" = 'Oracle Corp.' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle Corp' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle' THEN 'Oracle Corporation'
  
  -- IBM variations
  WHEN "hostCompany" = 'IBM Corp.' THEN 'International Business Machines Corporation'
  WHEN "hostCompany" = 'IBM Corp' THEN 'International Business Machines Corporation'
  WHEN "hostCompany" = 'IBM' THEN 'International Business Machines Corporation'
  
  -- Cisco variations
  WHEN "hostCompany" = 'Cisco Systems' THEN 'Cisco Systems Inc.'
  WHEN "hostCompany" = 'Cisco Inc.' THEN 'Cisco Systems Inc.'
  WHEN "hostCompany" = 'Cisco Systems Inc.' THEN 'Cisco Systems Inc.'
  
  -- AMD variations
  WHEN "hostCompany" = 'Advanced Micro Devices' THEN 'Advanced Micro Devices Inc.'
  WHEN "hostCompany" = 'AMD' THEN 'Advanced Micro Devices Inc.'
  WHEN "hostCompany" = 'AMD Corporation' THEN 'Advanced Micro Devices Inc.'
  
  -- Adobe variations
  WHEN "hostCompany" = 'Adobe Inc.' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems' THEN 'Adobe Inc.'
  
  -- Salesforce variations
  WHEN "hostCompany" = 'Salesforce Inc.' THEN 'Salesforce Inc.'
  WHEN "hostCompany" = 'Salesforce' THEN 'Salesforce Inc.'
  WHEN "hostCompany" = 'Salesforce Corporation' THEN 'Salesforce Inc.'
  
  -- Meta variations
  WHEN "hostCompany" = 'Meta Platforms' THEN 'Meta Platforms Inc.'
  WHEN "hostCompany" = 'Facebook' THEN 'Meta Platforms Inc.'
  WHEN "hostCompany" = 'Meta' THEN 'Meta Platforms Inc.'
  
  -- Netflix variations
  WHEN "hostCompany" = 'Netflix Inc.' THEN 'Netflix Inc.'
  WHEN "hostCompany" = 'Netflix' THEN 'Netflix Inc.'
  
  -- Apple variations
  WHEN "hostCompany" = 'Apple Inc.' THEN 'Apple Inc.'
  WHEN "hostCompany" = 'Apple' THEN 'Apple Inc.'
  
  -- Alphabet/Google variations
  WHEN "hostCompany" = 'Alphabet Inc.' THEN 'Alphabet Inc.'
  WHEN "hostCompany" = 'Google' THEN 'Alphabet Inc.'
  WHEN "hostCompany" = 'Google Inc.' THEN 'Alphabet Inc.'
  
  -- Amazon variations
  WHEN "hostCompany" = 'Amazon.com Inc.' THEN 'Amazon.com Inc.'
  WHEN "hostCompany" = 'Amazon' THEN 'Amazon.com Inc.'
  
  -- Tesla variations
  WHEN "hostCompany" = 'Tesla Inc.' THEN 'Tesla Inc.'
  WHEN "hostCompany" = 'Tesla' THEN 'Tesla Inc.'
  
  -- Otherwise keep the original name
  ELSE "hostCompany"
END
WHERE "hostCompany" IS NOT NULL;

-- Step 4: Update the updatedAt timestamp for all modified events
UPDATE events 
SET "updatedAt" = now()
WHERE "hostCompany" IS NOT NULL;

-- Step 5: Show the results of our updates
SELECT 
  "hostCompany" as company_name,
  COUNT(*) as event_count
FROM events 
GROUP BY "hostCompany" 
ORDER BY event_count DESC;

-- Step 6: Verify that all host company names now match gics_companies table
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