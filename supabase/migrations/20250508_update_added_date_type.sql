
-- Create a temporary column with the date type
ALTER TABLE subscriptions ADD COLUMN temp_added_date DATE;

-- Update the temporary column with the converted values from text column
UPDATE subscriptions 
SET temp_added_date = TO_DATE(added_date, 'DD/MM/YYYY')
WHERE added_date ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$';

-- Drop the original added_date column
ALTER TABLE subscriptions DROP COLUMN added_date;

-- Rename the temp column to added_date
ALTER TABLE subscriptions RENAME COLUMN temp_added_date TO added_date;

-- Do the same for pending_subscriptions table
ALTER TABLE pending_subscriptions ADD COLUMN temp_added_date DATE;

UPDATE pending_subscriptions 
SET temp_added_date = TO_DATE(added_date, 'DD/MM/YYYY')
WHERE added_date ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$';

ALTER TABLE pending_subscriptions DROP COLUMN added_date;
ALTER TABLE pending_subscriptions RENAME COLUMN temp_added_date TO added_date;
