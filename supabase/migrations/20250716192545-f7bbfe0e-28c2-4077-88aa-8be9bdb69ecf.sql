-- Update existing events to July and August 2025
-- This will update all events to be distributed across July and August 2025

UPDATE events 
SET 
  "startDate" = CASE 
    -- Events 1-10: July 2025 (various dates)
    WHEN "eventID" = 'e2f59dc8-e6e5-4943-be55-e906d0794fa6' THEN '2025-07-02 14:00:00+00'::timestamptz
    WHEN "eventID" = '0d71858d-489d-4184-aab4-93763d03edb4' THEN '2025-07-03 09:00:00+00'::timestamptz
    WHEN "eventID" = '8cd68987-2671-4201-a2a8-a026a96ccba6' THEN '2025-07-07 09:00:00+00'::timestamptz
    WHEN "eventID" = 'da4cb5a9-6165-4027-acd9-d3af789c07bf' THEN '2025-07-10 15:30:00+00'::timestamptz
    WHEN "eventID" = 'e2cff27f-9d5d-40e2-8fe8-2802f4f67da1' THEN '2025-07-14 14:00:00+00'::timestamptz
    WHEN "eventID" = 'e20d1557-d83a-4c13-9512-ef2562c6b108' THEN '2025-07-16 14:00:00+00'::timestamptz
    WHEN "eventID" = '707192c5-b519-41e8-8491-d637996db5a1' THEN '2025-07-17 14:00:00+00'::timestamptz
    WHEN "eventID" = 'eb7416cf-1b1b-4036-adb5-f22d8a36c4ce' THEN '2025-07-21 08:00:00+00'::timestamptz
    WHEN "eventID" = 'b8010465-97e2-47fb-b137-84c93a1aec46' THEN '2025-07-23 18:00:00+00'::timestamptz
    WHEN "eventID" = '237f8aee-9580-4660-9f31-635225653adb' THEN '2025-07-25 18:00:00+00'::timestamptz
    
    -- Events 11-20: August 2025 (various dates)
    WHEN "eventID" = '850a6bfc-b18c-470f-9d83-3752330cc184' THEN '2025-08-01 10:00:00+00'::timestamptz
    WHEN "eventID" = '6c6a6f23-b6c2-4554-b28d-68adaa869a7e' THEN '2025-08-05 10:00:00+00'::timestamptz
    WHEN "eventID" = '26b495cd-8cc4-472c-a144-ce1a557c777a' THEN '2025-08-07 10:00:00+00'::timestamptz
    WHEN "eventID" = '1d213bfe-1b73-48cc-92f9-3b59661a2f4c' THEN '2025-08-12 11:00:00+00'::timestamptz
    WHEN "eventID" = 'bb1ac412-55e9-4fce-b145-bcf30bb87c51' THEN '2025-08-14 11:00:00+00'::timestamptz
    WHEN "eventID" = 'a0bd4b1e-41ff-43be-ad24-20e0cd620a43' THEN '2025-08-18 13:00:00+00'::timestamptz
    WHEN "eventID" = 'e7049552-ec8f-47dc-af8e-0ffcfeff14b2' THEN '2025-08-21 08:30:00+00'::timestamptz
    WHEN "eventID" = '39107d3d-1df2-4da8-bb0b-2450f4c71024' THEN '2025-08-25 09:00:00+00'::timestamptz
    WHEN "eventID" = '0be644eb-f7ed-4dd8-9fd3-854a205f50d4' THEN '2025-08-27 09:00:00+00'::timestamptz
    WHEN "eventID" = 'abda7326-ca55-474b-b872-52d167fb97b5' THEN '2025-08-29 10:00:00+00'::timestamptz
    
    -- For any other events not listed above, distribute them randomly across July-August 2025
    ELSE ('2025-07-' || LPAD((1 + (RANDOM() * 31)::int)::text, 2, '0') || ' ' || 
          LPAD((9 + (RANDOM() * 8)::int)::text, 2, '0') || ':00:00+00')::timestamptz
  END,
  
  "endDate" = CASE 
    -- Update end dates to be 1-3 hours after start dates
    WHEN "eventID" = 'e2f59dc8-e6e5-4943-be55-e906d0794fa6' THEN '2025-07-02 15:00:00+00'::timestamptz
    WHEN "eventID" = '0d71858d-489d-4184-aab4-93763d03edb4' THEN '2025-07-03 10:00:00+00'::timestamptz
    WHEN "eventID" = '8cd68987-2671-4201-a2a8-a026a96ccba6' THEN '2025-07-07 10:00:00+00'::timestamptz
    WHEN "eventID" = 'da4cb5a9-6165-4027-acd9-d3af789c07bf' THEN '2025-07-10 16:30:00+00'::timestamptz
    WHEN "eventID" = 'e2cff27f-9d5d-40e2-8fe8-2802f4f67da1' THEN '2025-07-14 22:00:00+00'::timestamptz
    WHEN "eventID" = 'e20d1557-d83a-4c13-9512-ef2562c6b108' THEN '2025-07-16 17:00:00+00'::timestamptz
    WHEN "eventID" = '707192c5-b519-41e8-8491-d637996db5a1' THEN '2025-07-17 17:00:00+00'::timestamptz
    WHEN "eventID" = 'eb7416cf-1b1b-4036-adb5-f22d8a36c4ce' THEN '2025-07-21 17:00:00+00'::timestamptz
    WHEN "eventID" = 'b8010465-97e2-47fb-b137-84c93a1aec46' THEN '2025-07-23 20:00:00+00'::timestamptz
    WHEN "eventID" = '237f8aee-9580-4660-9f31-635225653adb' THEN '2025-07-25 20:00:00+00'::timestamptz
    
    WHEN "eventID" = '850a6bfc-b18c-470f-9d83-3752330cc184' THEN '2025-08-01 17:00:00+00'::timestamptz
    WHEN "eventID" = '6c6a6f23-b6c2-4554-b28d-68adaa869a7e' THEN '2025-08-05 11:30:00+00'::timestamptz
    WHEN "eventID" = '26b495cd-8cc4-472c-a144-ce1a557c777a' THEN '2025-08-07 11:30:00+00'::timestamptz
    WHEN "eventID" = '1d213bfe-1b73-48cc-92f9-3b59661a2f4c' THEN '2025-08-12 12:00:00+00'::timestamptz
    WHEN "eventID" = 'bb1ac412-55e9-4fce-b145-bcf30bb87c51' THEN '2025-08-14 12:00:00+00'::timestamptz
    WHEN "eventID" = 'a0bd4b1e-41ff-43be-ad24-20e0cd620a43' THEN '2025-08-18 15:00:00+00'::timestamptz
    WHEN "eventID" = 'e7049552-ec8f-47dc-af8e-0ffcfeff14b2' THEN '2025-08-21 09:30:00+00'::timestamptz
    WHEN "eventID" = '39107d3d-1df2-4da8-bb0b-2450f4c71024' THEN '2025-08-25 16:00:00+00'::timestamptz
    WHEN "eventID" = '0be644eb-f7ed-4dd8-9fd3-854a205f50d4' THEN '2025-08-27 16:00:00+00'::timestamptz
    WHEN "eventID" = 'abda7326-ca55-474b-b872-52d167fb97b5' THEN '2025-08-29 15:00:00+00'::timestamptz
    
    -- For any other events, add 1-3 hours to the new start date
    ELSE "startDate" + INTERVAL '1 hour' + (RANDOM() * INTERVAL '2 hours')
  END,
  
  "updatedAt" = now()
  
WHERE "startDate" < '2025-01-01'::timestamptz;