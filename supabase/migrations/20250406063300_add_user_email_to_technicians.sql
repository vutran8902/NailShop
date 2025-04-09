-- Add user_email column to salon_technicians table
ALTER TABLE salon_technicians ADD COLUMN user_email TEXT;

-- Create index for better performance
CREATE INDEX idx_salon_technicians_user_email ON salon_technicians(user_email);

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON salon_technicians;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON salon_technicians;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON salon_technicians;

-- Create new policies for salon_technicians
CREATE POLICY "Users can view their own technicians" 
ON salon_technicians FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert their own technicians" 
ON salon_technicians FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own technicians" 
ON salon_technicians FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete their own technicians" 
ON salon_technicians FOR DELETE USING (user_email = auth.email());
