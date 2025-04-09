-- Add duration_minutes column to appointment_schedule table
ALTER TABLE appointment_schedule
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Update existing records with default 30 minutes duration
UPDATE appointment_schedule
SET duration_minutes = 30
WHERE duration_minutes IS NULL;
