-- Insert sample companies
INSERT INTO public.user_companies ("companyName", "location") VALUES
('Apple Inc.', 'Cupertino, CA'),
('Microsoft Corp.', 'Redmond, WA'),
('Tesla Inc.', 'Austin, TX'),
('Amazon.com Inc.', 'Seattle, WA'),
('Alphabet Inc.', 'Mountain View, CA');

-- Insert sample events
INSERT INTO public.events ("eventName", "eventType", "hostCompany", "startDate", "endDate", "location", "description") VALUES
('Q4 Earnings Call', 'EARNINGS_CALL', 'Apple Inc.', '2024-01-25 09:00:00', '2024-01-25 10:00:00', 'Virtual Event', 'Quarterly earnings presentation and analyst Q&A'),
('Annual Investor Day', 'INVESTOR_MEETING', 'Microsoft Corp.', '2024-02-15 14:00:00', '2024-02-15 17:00:00', 'Redmond Campus', 'Annual strategic overview and future roadmap'),
('Product Launch Event', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2024-03-10 18:00:00', '2024-03-10 20:00:00', 'Austin Gigafactory', 'New vehicle model unveiling'),
('JPMorgan Tech Conference', 'CONFERENCE', 'Apple Inc.', '2024-03-20 10:00:00', '2024-03-20 11:30:00', 'San Francisco', 'Technology sector conference presentation'),
('AI Summit Presentation', 'CONFERENCE', 'Microsoft Corp.', '2024-04-05 11:00:00', '2024-04-05 12:00:00', 'Virtual Event', 'AI and cloud computing innovations'),
('Analyst Day 2024', 'ANALYST_DAY', 'Amazon.com Inc.', '2024-04-18 09:00:00', '2024-04-18 16:00:00', 'Seattle HQ', 'Comprehensive business review and strategy'),
('European Roadshow', 'ROADSHOW', 'Tesla Inc.', '2024-05-02 10:00:00', '2024-05-02 15:00:00', 'London, UK', 'European market expansion presentation'),
('Q1 Earnings Call', 'EARNINGS_CALL', 'Alphabet Inc.', '2024-05-15 16:00:00', '2024-05-15 17:00:00', 'Virtual Event', 'First quarter financial results'),
('Cloud Infrastructure Summit', 'CONFERENCE', 'Amazon.com Inc.', '2024-06-01 09:00:00', '2024-06-01 17:00:00', 'Las Vegas', 'AWS re:Invent conference'),
('Investor Meeting Q2', 'INVESTOR_MEETING', 'Apple Inc.', '2024-06-20 14:00:00', '2024-06-20 16:00:00', 'Cupertino Campus', 'Mid-year business update'),
('Sustainability Conference', 'CONFERENCE', 'Tesla Inc.', '2024-07-10 13:00:00', '2024-07-10 15:00:00', 'Berlin', 'Environmental impact and sustainability goals'),
('Developer Conference', 'PRODUCT_LAUNCH', 'Microsoft Corp.', '2024-07-25 10:00:00', '2024-07-25 18:00:00', 'Seattle', 'New developer tools and platform updates'),
('Q2 Earnings Call', 'EARNINGS_CALL', 'Amazon.com Inc.', '2024-08-01 17:00:00', '2024-08-01 18:00:00', 'Virtual Event', 'Second quarter earnings presentation'),
('Asia Pacific Roadshow', 'ROADSHOW', 'Alphabet Inc.', '2024-08-15 08:00:00', '2024-08-15 12:00:00', 'Tokyo, Japan', 'APAC market opportunities'),
('Hardware Launch Event', 'PRODUCT_LAUNCH', 'Apple Inc.', '2024-09-05 10:00:00', '2024-09-05 12:00:00', 'Cupertino', 'New hardware product announcements'),
('Enterprise Solutions Summit', 'CONFERENCE', 'Microsoft Corp.', '2024-09-20 09:00:00', '2024-09-20 16:00:00', 'Chicago', 'B2B solutions and enterprise products'),
('Autonomous Driving Demo', 'PRODUCT_LAUNCH', 'Tesla Inc.', '2024-10-01 15:00:00', '2024-10-01 17:00:00', 'Fremont Factory', 'Latest autopilot technology demonstration'),
('Q3 Earnings Call', 'EARNINGS_CALL', 'Alphabet Inc.', '2024-10-18 16:00:00', '2024-10-18 17:00:00', 'Virtual Event', 'Third quarter financial results'),
('Prime Day Briefing', 'INVESTOR_MEETING', 'Amazon.com Inc.', '2024-11-05 11:00:00', '2024-11-05 13:00:00', 'Virtual Event', 'Holiday season strategy and Prime Day results'),
('Year-End Investor Update', 'INVESTOR_MEETING', 'Tesla Inc.', '2024-12-15 14:00:00', '2024-12-15 16:00:00', 'Austin HQ', 'Annual performance review and 2025 outlook');