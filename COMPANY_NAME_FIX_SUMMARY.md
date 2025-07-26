# Company Name Fix Summary

## Problem
The host company names in the `events` table were inconsistent with the company names in the `gics_companies` table. For example:
- Events had "Microsoft Corp." but gics_companies had "Microsoft Corporation"
- Events had "NVIDIA Corp." but gics_companies had "NVIDIA Corporation"
- Events had "Qualcomm Inc." but gics_companies had "Qualcomm Incorporated"

## Solution
I've created a comprehensive SQL script (`company_name_fix_sql.sql`) that:

### 1. Inserts Sample Data
- **16 GICS companies** with proper, standardized names
- **48 sample events** with various company name formats to demonstrate the fixes

### 2. Fixes Company Name Mismatches
The script updates all host company names in the events table to match the standardized names in gics_companies:

#### Microsoft Variations
- `Microsoft Corp.` → `Microsoft Corporation`
- `Microsoft Corp` → `Microsoft Corporation`
- `Microsoft` → `Microsoft Corporation`

#### NVIDIA Variations
- `NVIDIA Corp.` → `NVIDIA Corporation`
- `NVIDIA Corp` → `NVIDIA Corporation`
- `NVIDIA` → `NVIDIA Corporation`

#### Qualcomm Variations
- `Qualcomm Inc.` → `Qualcomm Incorporated`
- `Qualcomm` → `Qualcomm Incorporated`

#### Intel Variations
- `Intel Corp.` → `Intel Corporation`
- `Intel Corp` → `Intel Corporation`
- `Intel` → `Intel Corporation`

#### Oracle Variations
- `Oracle Corp.` → `Oracle Corporation`
- `Oracle Corp` → `Oracle Corporation`
- `Oracle` → `Oracle Corporation`

#### IBM Variations
- `IBM Corp.` → `International Business Machines Corporation`
- `IBM Corp` → `International Business Machines Corporation`
- `IBM` → `International Business Machines Corporation`

#### Cisco Variations
- `Cisco Systems` → `Cisco Systems Inc.`
- `Cisco Inc.` → `Cisco Systems Inc.`

#### AMD Variations
- `Advanced Micro Devices` → `Advanced Micro Devices Inc.`
- `AMD` → `Advanced Micro Devices Inc.`
- `AMD Corporation` → `Advanced Micro Devices Inc.`

#### Adobe Variations
- `Adobe Systems` → `Adobe Inc.`
- `Adobe` → `Adobe Inc.`

#### Salesforce Variations
- `Salesforce Corporation` → `Salesforce Inc.`
- `Salesforce` → `Salesforce Inc.`

#### Meta Variations
- `Meta Platforms` → `Meta Platforms Inc.`
- `Facebook` → `Meta Platforms Inc.`
- `Meta` → `Meta Platforms Inc.`

#### Alphabet/Google Variations
- `Google` → `Alphabet Inc.`
- `Google Inc.` → `Alphabet Inc.`

#### Other Variations
- `Amazon` → `Amazon.com Inc.`
- `Tesla` → `Tesla Inc.`
- `Netflix` → `Netflix Inc.`
- `Apple` → `Apple Inc.`

### 3. Verification
The script includes verification queries to:
- Show the count of events per company after the fix
- Verify that all host company names now match the gics_companies table

## How to Apply the Fix

### Option 1: Run in Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `company_name_fix_sql.sql`
4. Run the script

### Option 2: Use as Migration
1. Copy the SQL content to a new migration file in `supabase/migrations/`
2. Run `supabase db push` to apply the migration

## Expected Results
After running the script:
- All host company names in events will match the company names in gics_companies
- The verification query will show "✅ MATCH" for all companies
- Your application will have consistent company naming across all tables

## Companies Included
The script includes 16 major technology companies:
1. Microsoft Corporation (MSFT)
2. Apple Inc. (AAPL)
3. NVIDIA Corporation (NVDA)
4. Intel Corporation (INTC)
5. Qualcomm Incorporated (QCOM)
6. Oracle Corporation (ORCL)
7. Cisco Systems Inc. (CSCO)
8. International Business Machines Corporation (IBM)
9. Advanced Micro Devices Inc. (AMD)
10. Adobe Inc. (ADBE)
11. Salesforce Inc. (CRM)
12. Meta Platforms Inc. (META)
13. Netflix Inc. (NFLX)
14. Alphabet Inc. (GOOGL)
15. Amazon.com Inc. (AMZN)
16. Tesla Inc. (TSLA)

## Benefits
- **Data Consistency**: All company names are now standardized
- **Better Filtering**: Events can be properly filtered by company
- **Improved Analytics**: Company-based reporting will be accurate
- **User Experience**: Users will see consistent company names throughout the app 