-- Fix existing events where endDate is before or equal to startDate
-- Set endDate to startDate for these invalid entries
UPDATE events 
SET "endDate" = "startDate"
WHERE "endDate" IS NOT NULL AND "startDate" >= "endDate";