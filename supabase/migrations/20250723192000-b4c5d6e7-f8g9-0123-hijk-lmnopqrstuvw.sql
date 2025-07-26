-- Fix company name mismatches between events and gics_companies tables
-- This migration updates event hostCompany names to match gics_companies table

-- Update event hostCompany names to match gics_companies table
UPDATE events 
SET "hostCompany" = CASE 
  -- Microsoft variations
  WHEN "hostCompany" = 'Microsoft Corp.' THEN 'Microsoft Corporation'
  WHEN "hostCompany" = 'Microsoft Corp' THEN 'Microsoft Corporation'
  WHEN "hostCompany" = 'Microsoft' THEN 'Microsoft Corporation'
  
  -- Intel variations
  WHEN "hostCompany" = 'Intel Corp.' THEN 'Intel Corporation'
  WHEN "hostCompany" = 'Intel Corp' THEN 'Intel Corporation'
  WHEN "hostCompany" = 'Intel' THEN 'Intel Corporation'
  
  -- Apple variations
  WHEN "hostCompany" = 'Apple Inc.' THEN 'Apple Inc.'
  WHEN "hostCompany" = 'Apple' THEN 'Apple Inc.'
  
  -- Amazon variations
  WHEN "hostCompany" = 'Amazon.com Inc.' THEN 'Amazon.com Inc.'
  WHEN "hostCompany" = 'Amazon' THEN 'Amazon.com Inc.'
  
  -- Alphabet/Google variations
  WHEN "hostCompany" = 'Alphabet Inc.' THEN 'Alphabet Inc.'
  WHEN "hostCompany" = 'Google' THEN 'Alphabet Inc.'
  WHEN "hostCompany" = 'Google Inc.' THEN 'Alphabet Inc.'
  
  -- Tesla variations
  WHEN "hostCompany" = 'Tesla Inc.' THEN 'Tesla Inc.'
  WHEN "hostCompany" = 'Tesla' THEN 'Tesla Inc.'
  
  -- NVIDIA variations
  WHEN "hostCompany" = 'NVIDIA Corp.' THEN 'NVIDIA Corporation'
  WHEN "hostCompany" = 'NVIDIA Corp' THEN 'NVIDIA Corporation'
  WHEN "hostCompany" = 'NVIDIA' THEN 'NVIDIA Corporation'
  
  -- AMD variations
  WHEN "hostCompany" = 'Advanced Micro Devices' THEN 'Advanced Micro Devices Inc.'
  WHEN "hostCompany" = 'AMD' THEN 'Advanced Micro Devices Inc.'
  
  -- Oracle variations
  WHEN "hostCompany" = 'Oracle Corp.' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle Corp' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle' THEN 'Oracle Corporation'
  
  -- Cisco variations
  WHEN "hostCompany" = 'Cisco Systems' THEN 'Cisco Systems Inc.'
  WHEN "hostCompany" = 'Cisco' THEN 'Cisco Systems Inc.'
  
  -- IBM variations
  WHEN "hostCompany" = 'IBM Corp.' THEN 'International Business Machines Corporation'
  WHEN "hostCompany" = 'IBM Corp' THEN 'International Business Machines Corporation'
  WHEN "hostCompany" = 'IBM' THEN 'International Business Machines Corporation'
  
  -- Qualcomm variations
  WHEN "hostCompany" = 'Qualcomm Inc.' THEN 'Qualcomm Incorporated'
  WHEN "hostCompany" = 'Qualcomm' THEN 'Qualcomm Incorporated'
  
  -- Adobe variations
  WHEN "hostCompany" = 'Adobe Inc.' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe' THEN 'Adobe Inc.'
  
  -- Salesforce variations
  WHEN "hostCompany" = 'Salesforce Inc.' THEN 'Salesforce Inc.'
  WHEN "hostCompany" = 'Salesforce' THEN 'Salesforce Inc.'
  
  -- Netflix variations
  WHEN "hostCompany" = 'Netflix Inc.' THEN 'Netflix Inc.'
  WHEN "hostCompany" = 'Netflix' THEN 'Netflix Inc.'
  
  -- Meta variations
  WHEN "hostCompany" = 'Meta Platforms' THEN 'Meta Platforms Inc.'
  WHEN "hostCompany" = 'Facebook' THEN 'Meta Platforms Inc.'
  WHEN "hostCompany" = 'Meta' THEN 'Meta Platforms Inc.'
  
  -- Otherwise keep the original name
  ELSE "hostCompany"
END
WHERE "hostCompany" IS NOT NULL;

-- Also update the updatedAt timestamp
UPDATE events 
SET "updatedAt" = now()
WHERE "hostCompany" IS NOT NULL;

-- Show the results of our updates
SELECT 
  "hostCompany" as company_name,
  COUNT(*) as event_count
FROM events 
GROUP BY "hostCompany" 
ORDER BY event_count DESC; 