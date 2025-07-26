-- Insert Sample Data for Landing Page Statistics
-- This script adds sample companies, events, and users to make the landing page look realistic

-- Step 1: Insert sample GICS companies
INSERT INTO public.gics_companies ("companyID", "companyName", "tickerSymbol", "gicsSector", "gicsSubCategory") VALUES
-- Technology Companies
('550e8400-e29b-41d4-a716-446655440001', 'Microsoft Corporation', 'MSFT', 'Information Technology', 'Software'),
('550e8400-e29b-41d4-a716-446655440002', 'Apple Inc.', 'AAPL', 'Information Technology', 'Technology Hardware'),
('550e8400-e29b-41d4-a716-446655440003', 'NVIDIA Corporation', 'NVDA', 'Information Technology', 'Semiconductors'),
('550e8400-e29b-41d4-a716-446655440004', 'Amazon.com Inc.', 'AMZN', 'Consumer Discretionary', 'Internet & Direct Marketing'),
('550e8400-e29b-41d4-a716-446655440005', 'Alphabet Inc.', 'GOOGL', 'Communication Services', 'Interactive Media'),
('550e8400-e29b-41d4-a716-446655440006', 'Tesla Inc.', 'TSLA', 'Consumer Discretionary', 'Automobiles'),
('550e8400-e29b-41d4-a716-446655440007', 'Intel Corporation', 'INTC', 'Information Technology', 'Semiconductors'),
('550e8400-e29b-41d4-a716-446655440008', 'Qualcomm Incorporated', 'QCOM', 'Information Technology', 'Semiconductors'),
('550e8400-e29b-41d4-a716-446655440009', 'Oracle Corporation', 'ORCL', 'Information Technology', 'Software'),
('550e8400-e29b-41d4-a716-446655440010', 'Cisco Systems Inc.', 'CSCO', 'Information Technology', 'Communications Equipment'),

-- Financial Companies
('550e8400-e29b-41d4-a716-446655440011', 'JPMorgan Chase & Co.', 'JPM', 'Financials', 'Banks'),
('550e8400-e29b-41d4-a716-446655440012', 'Bank of America Corp.', 'BAC', 'Financials', 'Banks'),
('550e8400-e29b-41d4-a716-446655440013', 'Goldman Sachs Group Inc.', 'GS', 'Financials', 'Capital Markets'),
('550e8400-e29b-41d4-a716-446655440014', 'Morgan Stanley', 'MS', 'Financials', 'Capital Markets'),
('550e8400-e29b-41d4-a716-446655440015', 'BlackRock Inc.', 'BLK', 'Financials', 'Capital Markets'),

-- Healthcare Companies
('550e8400-e29b-41d4-a716-446655440016', 'Johnson & Johnson', 'JNJ', 'Healthcare', 'Pharmaceuticals'),
('550e8400-e29b-41d4-a716-446655440017', 'Pfizer Inc.', 'PFE', 'Healthcare', 'Pharmaceuticals'),
('550e8400-e29b-41d4-a716-446655440018', 'UnitedHealth Group Inc.', 'UNH', 'Healthcare', 'Healthcare Services'),
('550e8400-e29b-41d4-a716-446655440019', 'Abbott Laboratories', 'ABT', 'Healthcare', 'Healthcare Equipment'),
('550e8400-e29b-41d4-a716-446655440020', 'Eli Lilly and Company', 'LLY', 'Healthcare', 'Pharmaceuticals'),

-- Energy Companies
('550e8400-e29b-41d4-a716-446655440021', 'Exxon Mobil Corporation', 'XOM', 'Energy', 'Oil, Gas & Consumable Fuels'),
('550e8400-e29b-41d4-a716-446655440022', 'Chevron Corporation', 'CVX', 'Energy', 'Oil, Gas & Consumable Fuels'),
('550e8400-e29b-41d4-a716-446655440023', 'ConocoPhillips', 'COP', 'Energy', 'Oil, Gas & Consumable Fuels'),
('550e8400-e29b-41d4-a716-446655440024', 'EOG Resources Inc.', 'EOG', 'Energy', 'Oil, Gas & Consumable Fuels'),
('550e8400-e29b-41d4-a716-446655440025', 'Pioneer Natural Resources', 'PXD', 'Energy', 'Oil, Gas & Consumable Fuels'),

-- Consumer Companies
('550e8400-e29b-41d4-a716-446655440026', 'Procter & Gamble Co.', 'PG', 'Consumer Staples', 'Household Products'),
('550e8400-e29b-41d4-a716-446655440027', 'Coca-Cola Company', 'KO', 'Consumer Staples', 'Beverages'),
('550e8400-e29b-41d4-a716-446655440028', 'Walmart Inc.', 'WMT', 'Consumer Staples', 'Food & Staples Retailing'),
('550e8400-e29b-41d4-a716-446655440029', 'Home Depot Inc.', 'HD', 'Consumer Discretionary', 'Specialty Retail'),
('550e8400-e29b-41d4-a716-446655440030', 'McDonald''s Corporation', 'MCD', 'Consumer Discretionary', 'Hotels, Restaurants & Leisure'),

-- Industrial Companies
('550e8400-e29b-41d4-a716-446655440031', 'Boeing Company', 'BA', 'Industrials', 'Aerospace & Defense'),
('550e8400-e29b-41d4-a716-446655440032', 'General Electric Company', 'GE', 'Industrials', 'Industrial Conglomerates'),
('550e8400-e29b-41d4-a716-446655440033', '3M Company', 'MMM', 'Industrials', 'Industrial Conglomerates'),
('550e8400-e29b-41d4-a716-446655440034', 'Caterpillar Inc.', 'CAT', 'Industrials', 'Machinery'),
('550e8400-e29b-41d4-a716-446655440035', 'United Parcel Service', 'UPS', 'Industrials', 'Air Freight & Logistics'),

-- Materials Companies
('550e8400-e29b-41d4-a716-446655440036', 'DuPont de Nemours Inc.', 'DD', 'Materials', 'Chemicals'),
('550e8400-e29b-41d4-a716-446655440037', 'Dow Inc.', 'DOW', 'Materials', 'Chemicals'),
('550e8400-e29b-41d4-a716-446655440038', 'Freeport-McMoRan Inc.', 'FCX', 'Materials', 'Metals & Mining'),
('550e8400-e29b-41d4-a716-446655440039', 'Newmont Corporation', 'NEM', 'Materials', 'Metals & Mining'),
('550e8400-e29b-41d4-a716-446655440040', 'Air Products and Chemicals', 'APD', 'Materials', 'Chemicals'),

-- Real Estate Companies
('550e8400-e29b-41d4-a716-446655440041', 'American Tower Corporation', 'AMT', 'Real Estate', 'Equity Real Estate Investment Trusts'),
('550e8400-e29b-41d4-a716-446655440042', 'Crown Castle International', 'CCI', 'Real Estate', 'Equity Real Estate Investment Trusts'),
('550e8400-e29b-41d4-a716-446655440043', 'Prologis Inc.', 'PLD', 'Real Estate', 'Equity Real Estate Investment Trusts'),
('550e8400-e29b-41d4-a716-446655440044', 'Equinix Inc.', 'EQIX', 'Real Estate', 'Equity Real Estate Investment Trusts'),
('550e8400-e29b-41d4-a716-446655440045', 'Digital Realty Trust', 'DLR', 'Real Estate', 'Equity Real Estate Investment Trusts'),

-- Utilities Companies
('550e8400-e29b-41d4-a716-446655440046', 'NextEra Energy Inc.', 'NEE', 'Utilities', 'Electric Utilities'),
('550e8400-e29b-41d4-a716-446655440047', 'Duke Energy Corporation', 'DUK', 'Utilities', 'Electric Utilities'),
('550e8400-e29b-41d4-a716-446655440048', 'Southern Company', 'SO', 'Utilities', 'Electric Utilities'),
('550e8400-e29b-41d4-a716-446655440049', 'Dominion Energy Inc.', 'D', 'Utilities', 'Electric Utilities'),
('550e8400-e29b-41d4-a716-446655440050', 'American Electric Power', 'AEP', 'Utilities', 'Electric Utilities');

-- Step 2: Insert sample events
INSERT INTO public.events ("eventID", "eventName", "eventType", "hostCompany", "startDate", "endDate", "location", "description") VALUES
-- Q1 2025 Events
('evt-001', 'Microsoft Q1 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corporation', '2025-01-28 16:00:00', '2025-01-28 17:00:00', 'Virtual Event', 'First quarter 2025 earnings conference call'),
('evt-002', 'Apple Q1 Earnings Call', 'EARNINGS_CALL', 'Apple Inc.', '2025-01-30 16:00:00', '2025-01-30 17:00:00', 'Virtual Event', 'First quarter 2025 earnings conference call'),
('evt-003', 'Amazon Q1 Earnings Call', 'EARNINGS_CALL', 'Amazon.com Inc.', '2025-02-01 16:00:00', '2025-02-01 17:00:00', 'Virtual Event', 'First quarter 2025 earnings conference call'),
('evt-004', 'Alphabet Q1 Earnings Call', 'EARNINGS_CALL', 'Alphabet Inc.', '2025-02-03 16:00:00', '2025-02-03 17:00:00', 'Virtual Event', 'First quarter 2025 earnings conference call'),
('evt-005', 'Tesla Q1 Earnings Call', 'EARNINGS_CALL', 'Tesla Inc.', '2025-02-05 16:00:00', '2025-02-05 17:00:00', 'Virtual Event', 'First quarter 2025 earnings conference call'),

-- Q2 2025 Events
('evt-006', 'Microsoft Q2 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corporation', '2025-04-22 16:00:00', '2025-04-22 17:00:00', 'Virtual Event', 'Second quarter 2025 earnings conference call'),
('evt-007', 'Apple Q2 Earnings Call', 'EARNINGS_CALL', 'Apple Inc.', '2025-04-24 16:00:00', '2025-04-24 17:00:00', 'Virtual Event', 'Second quarter 2025 earnings conference call'),
('evt-008', 'Amazon Q2 Earnings Call', 'EARNINGS_CALL', 'Amazon.com Inc.', '2025-04-26 16:00:00', '2025-04-26 17:00:00', 'Virtual Event', 'Second quarter 2025 earnings conference call'),
('evt-009', 'Alphabet Q2 Earnings Call', 'EARNINGS_CALL', 'Alphabet Inc.', '2025-04-28 16:00:00', '2025-04-28 17:00:00', 'Virtual Event', 'Second quarter 2025 earnings conference call'),
('evt-010', 'Tesla Q2 Earnings Call', 'EARNINGS_CALL', 'Tesla Inc.', '2025-04-30 16:00:00', '2025-04-30 17:00:00', 'Virtual Event', 'Second quarter 2025 earnings conference call'),

-- Q3 2025 Events
('evt-011', 'Microsoft Q3 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corporation', '2025-07-22 16:00:00', '2025-07-22 17:00:00', 'Virtual Event', 'Third quarter 2025 earnings conference call'),
('evt-012', 'Apple Q3 Earnings Call', 'EARNINGS_CALL', 'Apple Inc.', '2025-07-24 16:00:00', '2025-07-24 17:00:00', 'Virtual Event', 'Third quarter 2025 earnings conference call'),
('evt-013', 'Amazon Q3 Earnings Call', 'EARNINGS_CALL', 'Amazon.com Inc.', '2025-07-26 16:00:00', '2025-07-26 17:00:00', 'Virtual Event', 'Third quarter 2025 earnings conference call'),
('evt-014', 'Alphabet Q3 Earnings Call', 'EARNINGS_CALL', 'Alphabet Inc.', '2025-07-28 16:00:00', '2025-07-28 17:00:00', 'Virtual Event', 'Third quarter 2025 earnings conference call'),
('evt-015', 'Tesla Q3 Earnings Call', 'EARNINGS_CALL', 'Tesla Inc.', '2025-07-30 16:00:00', '2025-07-30 17:00:00', 'Virtual Event', 'Third quarter 2025 earnings conference call'),

-- Q4 2025 Events
('evt-016', 'Microsoft Q4 Earnings Call', 'EARNINGS_CALL', 'Microsoft Corporation', '2025-10-21 16:00:00', '2025-10-21 17:00:00', 'Virtual Event', 'Fourth quarter 2025 earnings conference call'),
('evt-017', 'Apple Q4 Earnings Call', 'EARNINGS_CALL', 'Apple Inc.', '2025-10-23 16:00:00', '2025-10-23 17:00:00', 'Virtual Event', 'Fourth quarter 2025 earnings conference call'),
('evt-018', 'Amazon Q4 Earnings Call', 'EARNINGS_CALL', 'Amazon.com Inc.', '2025-10-25 16:00:00', '2025-10-25 17:00:00', 'Virtual Event', 'Fourth quarter 2025 earnings conference call'),
('evt-019', 'Alphabet Q4 Earnings Call', 'EARNINGS_CALL', 'Alphabet Inc.', '2025-10-27 16:00:00', '2025-10-27 17:00:00', 'Virtual Event', 'Fourth quarter 2025 earnings conference call'),
('evt-020', 'Tesla Q4 Earnings Call', 'EARNINGS_CALL', 'Tesla Inc.', '2025-10-29 16:00:00', '2025-10-29 17:00:00', 'Virtual Event', 'Fourth quarter 2025 earnings conference call'),

-- Investor Meetings
('evt-021', 'Microsoft Investor Day', 'INVESTOR_MEETING', 'Microsoft Corporation', '2025-03-15 09:00:00', '2025-03-15 17:00:00', 'Redmond, WA', 'Annual investor day with strategic overview'),
('evt-022', 'Apple Investor Day', 'INVESTOR_MEETING', 'Apple Inc.', '2025-03-20 09:00:00', '2025-03-20 17:00:00', 'Cupertino, CA', 'Annual investor day with product roadmap'),
('evt-023', 'Amazon Investor Day', 'INVESTOR_MEETING', 'Amazon.com Inc.', '2025-03-25 09:00:00', '2025-03-25 17:00:00', 'Seattle, WA', 'Annual investor day with AWS and retail updates'),
('evt-024', 'Tesla Investor Day', 'INVESTOR_MEETING', 'Tesla Inc.', '2025-03-30 09:00:00', '2025-03-30 17:00:00', 'Austin, TX', 'Annual investor day with vehicle roadmap'),
('evt-025', 'NVIDIA Investor Day', 'INVESTOR_MEETING', 'NVIDIA Corporation', '2025-04-05 09:00:00', '2025-04-05 17:00:00', 'Santa Clara, CA', 'Annual investor day with AI strategy'),

-- Conferences
('evt-026', 'Microsoft Build Conference', 'CONFERENCE', 'Microsoft Corporation', '2025-05-20 09:00:00', '2025-05-22 17:00:00', 'Seattle, WA', 'Annual developer conference'),
('evt-027', 'Apple WWDC', 'CONFERENCE', 'Apple Inc.', '2025-06-09 09:00:00', '2025-06-13 17:00:00', 'Cupertino, CA', 'Worldwide Developers Conference'),
('evt-028', 'Amazon re:Invent', 'CONFERENCE', 'Amazon.com Inc.', '2025-11-30 09:00:00', '2025-12-04 17:00:00', 'Las Vegas, NV', 'AWS annual conference'),
('evt-029', 'NVIDIA GTC', 'CONFERENCE', 'NVIDIA Corporation', '2025-03-18 09:00:00', '2025-03-21 17:00:00', 'San Jose, CA', 'GPU Technology Conference'),
('evt-030', 'Tesla AI Day', 'CONFERENCE', 'Tesla Inc.', '2025-09-15 09:00:00', '2025-09-15 17:00:00', 'Palo Alto, CA', 'AI and autonomy showcase'),

-- Roadshows
('evt-031', 'Microsoft European Roadshow', 'ROADSHOW', 'Microsoft Corporation', '2025-02-10 09:00:00', '2025-02-14 17:00:00', 'London, UK', 'European investor roadshow'),
('evt-032', 'Apple Asian Roadshow', 'ROADSHOW', 'Apple Inc.', '2025-02-17 09:00:00', '2025-02-21 17:00:00', 'Tokyo, Japan', 'Asian investor roadshow'),
('evt-033', 'Amazon US Roadshow', 'ROADSHOW', 'Amazon.com Inc.', '2025-02-24 09:00:00', '2025-02-28 17:00:00', 'New York, NY', 'US investor roadshow'),
('evt-034', 'Tesla European Roadshow', 'ROADSHOW', 'Tesla Inc.', '2025-03-03 09:00:00', '2025-03-07 17:00:00', 'Berlin, Germany', 'European investor roadshow'),
('evt-035', 'NVIDIA Asian Roadshow', 'ROADSHOW', 'NVIDIA Corporation', '2025-03-10 09:00:00', '2025-03-14 17:00:00', 'Singapore', 'Asian investor roadshow'),

-- Analyst Days
('evt-036', 'Microsoft Analyst Day', 'ANALYST_DAY', 'Microsoft Corporation', '2025-06-15 09:00:00', '2025-06-15 17:00:00', 'Redmond, WA', 'Analyst day with detailed financial guidance'),
('evt-037', 'Apple Analyst Day', 'ANALYST_DAY', 'Apple Inc.', '2025-06-20 09:00:00', '2025-06-20 17:00:00', 'Cupertino, CA', 'Analyst day with services strategy'),
('evt-038', 'Amazon Analyst Day', 'ANALYST_DAY', 'Amazon.com Inc.', '2025-06-25 09:00:00', '2025-06-25 17:00:00', 'Seattle, WA', 'Analyst day with AWS and retail metrics'),
('evt-039', 'Tesla Analyst Day', 'ANALYST_DAY', 'Tesla Inc.', '2025-06-30 09:00:00', '2025-06-30 17:00:00', 'Austin, TX', 'Analyst day with production and delivery outlook'),
('evt-040', 'NVIDIA Analyst Day', 'ANALYST_DAY', 'NVIDIA Corporation', '2025-07-05 09:00:00', '2025-07-05 17:00:00', 'Santa Clara, CA', 'Analyst day with AI and gaming strategy'),

-- Product Launches
('evt-041', 'Microsoft Surface Launch', 'PRODUCT_LAUNCH', 'Microsoft Corporation', '2025-09-15 10:00:00', '2025-09-15 12:00:00', 'New York, NY', 'New Surface device launch event'),
('evt-042', 'Apple iPhone Launch', 'PRODUCT_LAUNCH', 'Apple Inc.', '2025-09-10 10:00:00', '2025-09-10 12:00:00', 'Cupertino, CA', 'iPhone 17 launch event'),
('evt-043', 'Amazon Prime Day', 'PRODUCT_LAUNCH', 'Amazon.com Inc.', '2025-07-15 00:00:00', '2025-07-16 23:59:59', 'Global', 'Annual Prime Day shopping event'),
('evt-044', 'Tesla Cybertruck Launch', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2025-08-15 10:00:00', '2025-08-15 12:00:00', 'Austin, TX', 'Cybertruck production launch'),
('evt-045', 'NVIDIA GPU Launch', 'PRODUCT_LAUNCH', 'NVIDIA Corporation', '2025-08-20 10:00:00', '2025-08-20 12:00:00', 'Santa Clara, CA', 'Next-generation GPU launch'),

-- Additional Events for variety
('evt-046', 'JPMorgan Healthcare Conference', 'CONFERENCE', 'JPMorgan Chase & Co.', '2025-01-13 09:00:00', '2025-01-16 17:00:00', 'San Francisco, CA', 'Annual healthcare investment conference'),
('evt-047', 'Goldman Sachs Tech Conference', 'CONFERENCE', 'Goldman Sachs Group Inc.', '2025-02-25 09:00:00', '2025-02-27 17:00:00', 'Las Vegas, NV', 'Technology investment conference'),
('evt-048', 'Morgan Stanley TMT Conference', 'CONFERENCE', 'Morgan Stanley', '2025-03-05 09:00:00', '2025-03-07 17:00:00', 'San Francisco, CA', 'Technology, Media & Telecom conference'),
('evt-049', 'BlackRock Investment Forum', 'CONFERENCE', 'BlackRock Inc.', '2025-04-15 09:00:00', '2025-04-17 17:00:00', 'New York, NY', 'Global investment outlook forum'),
('evt-050', 'Exxon Mobil Energy Summit', 'CONFERENCE', 'Exxon Mobil Corporation', '2025-05-10 09:00:00', '2025-05-12 17:00:00', 'Houston, TX', 'Energy industry summit');

-- Step 3: Show the results
SELECT 'SAMPLE DATA INSERTED SUCCESSFULLY!' as status;

SELECT 'COMPANIES COUNT:' as info, COUNT(*) as count FROM gics_companies;
SELECT 'EVENTS COUNT:' as info, COUNT(*) as count FROM events;

-- Step 4: Show sample of inserted data
SELECT 'SAMPLE COMPANIES:' as info;
SELECT "companyName", "tickerSymbol", "gicsSector" FROM gics_companies ORDER BY "companyName" LIMIT 10;

SELECT 'SAMPLE EVENTS:' as info;
SELECT "eventName", "hostCompany", "eventType", "startDate" FROM events ORDER BY "startDate" LIMIT 10; 