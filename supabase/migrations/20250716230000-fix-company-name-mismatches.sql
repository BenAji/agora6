-- Fix company name mismatches between events and gics_companies tables
-- This migration updates event hostCompany names to match gics_companies table

-- First, let's see what company names we have in both tables
-- This will help us identify all the mismatches

-- Update event hostCompany names to match gics_companies table
UPDATE events 
SET "hostCompany" = CASE 
  -- Microsoft variations
  WHEN "hostCompany" = 'Microsoft Corp.' THEN 'Microsoft Corporation'
  WHEN "hostCompany" = 'Microsoft Corp' THEN 'Microsoft Corporation'
  WHEN "hostCompany" = 'Microsoft' THEN 'Microsoft Corporation'
  
  -- Intel variations
  WHEN "hostCompany" = 'Intel Corp.' THEN 'Intel'
  WHEN "hostCompany" = 'Intel Corp' THEN 'Intel'
  WHEN "hostCompany" = 'Intel Corporation' THEN 'Intel'
  
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
  WHEN "hostCompany" = 'NVIDIA Corp.' THEN 'Nvidia'
  WHEN "hostCompany" = 'NVIDIA Corp' THEN 'Nvidia'
  WHEN "hostCompany" = 'NVIDIA' THEN 'Nvidia'
  WHEN "hostCompany" = 'NVIDIA Corporation' THEN 'Nvidia'
  
  -- AMD variations
  WHEN "hostCompany" = 'Advanced Micro Devices Inc.' THEN 'Advanced Micro Devices'
  WHEN "hostCompany" = 'AMD Corporation' THEN 'Advanced Micro Devices'
  WHEN "hostCompany" = 'AMD' THEN 'Advanced Micro Devices'
  
  -- Oracle variations
  WHEN "hostCompany" = 'Oracle Corp.' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle Corp.' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle Corp. Inc.' THEN 'Oracle Corporation'
  WHEN "hostCompany" = 'Oracle Corporations' THEN 'Oracle Corporation'
  
  -- Cisco variations
  WHEN "hostCompany" = 'Cisco Systems' THEN 'Cisco'
  WHEN "hostCompany" = 'Cisco Inc.' THEN 'Cisco'
  WHEN "hostCompany" = 'Cisco Systems Inc.' THEN 'Cisco'

  -- IBM variations
  WHEN "hostCompany" = 'IBM Corp.' THEN 'IBM'
  WHEN "hostCompany" = 'IBM Corp' THEN 'IBM'
  WHEN "hostCompany" = 'IBM' THEN 'IBM'
  WHEN "hostCompany" = 'IBM Corporation' THEN 'IBM' 
  WHEN "hostCompany" = 'International Business Machines Corporation' THEN 'IBM'
  WHEN "hostCompany" = 'International Business Machines' THEN 'IBM'
  WHEN "hostCompany" = 'International Business Machines Inc.' THEN 'IBM'
  WHEN "hostCompany" = 'International Business Machines Inc' THEN 'IBM'
  
  
  -- Qualcomm variations
  WHEN "hostCompany" = 'Qualcomm Inc.' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm Incorporated' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm Inc' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm Corporation' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm Inc. Inc.' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm Inc. Inc' THEN 'Qualcomm'
  WHEN "hostCompany" = 'Qualcomm Inc. Inc.' THEN 'Qualcomm'
  
  -- Adobe variations
  WHEN "hostCompany" = 'Adobe Inc.' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems Incorporated' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems Inc.' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems Inc' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems Inc. Inc.' THEN 'Adobe Inc.'
  WHEN "hostCompany" = 'Adobe Systems Inc. Inc' THEN 'Adobe Inc.'
  
  -- Salesforce variations
  WHEN "hostCompany" = 'Salesforce Inc.' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Corporation' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc. Inc.' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc. Inc' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc. Inc.' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc. Inc' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc. Inc.' THEN 'Salesforce'
  WHEN "hostCompany" = 'Salesforce Inc. Inc' THEN 'Salesforce'
 
  
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