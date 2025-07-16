-- Remove duplicate companies from user_companies table
-- Keep the oldest entry (first createdAt) for each company name

-- Delete duplicates, keeping only the record with the minimum createdAt for each companyName
DELETE FROM user_companies 
WHERE "companyID" IN (
    SELECT "companyID"
    FROM (
        SELECT "companyID",
               ROW_NUMBER() OVER (
                   PARTITION BY "companyName" 
                   ORDER BY "createdAt" ASC
               ) as row_num
        FROM user_companies
        WHERE "companyName" IN (
            SELECT "companyName"
            FROM user_companies
            GROUP BY "companyName"
            HAVING COUNT(*) > 1
        )
    ) ranked
    WHERE row_num > 1
);

-- Verify the cleanup by showing remaining companies
-- This will show in the migration result
SELECT "companyName", COUNT(*) as count
FROM user_companies 
WHERE "companyName" IN ('Alphabet Inc.', 'Apple Inc.', 'Amazon.com Inc.', 'Microsoft Corp.', 'Tesla Inc.')
GROUP BY "companyName"
ORDER BY "companyName";