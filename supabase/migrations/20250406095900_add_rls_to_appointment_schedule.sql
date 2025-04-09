-- Add user_email column to appointment_schedule table
ALTER TABLE appointment_schedule ADD COLUMN user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_appointment_schedule_user_email ON appointment_schedule(user_email);

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
