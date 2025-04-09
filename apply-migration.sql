-- Migration to add user_email to appointment_schedule table and set up RLS policies

-- Add user_email column to appointment_schedule table
ALTER TABLE appointment_schedule ADD COLUMN IF NOT EXISTS user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_schedule_user_email ON appointment_schedule(user_email);

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointment_schedule;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointment_schedule;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointment_schedule;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointment_schedule;

-- Create new policies for appointment_schedule
CREATE POLICY "Users can view their own appointments" 
ON appointment_schedule FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert their own appointments" 
ON appointment_schedule FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own appointments" 
ON appointment_schedule FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete their own appointments" 
ON appointment_schedule FOR DELETE USING (user_email = auth.email());

-- Update existing records to set user_email based on customer_email
UPDATE appointment_schedule 
SET user_email = customer_email 
WHERE user_email IS NULL;

-- Verify the changes
SELECT COUNT(*) AS records_with_user_email FROM appointment_schedule WHERE user_email IS NOT NULL;
