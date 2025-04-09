-- Add user_email column to salon_services table
ALTER TABLE salon_services ADD COLUMN user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_salon_services_user_email ON salon_services(user_email);

-- Create policies for salon_services
CREATE POLICY "Users can view their own services" 
ON salon_services FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert their own services" 
ON salon_services FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own services" 
ON salon_services FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete their own services" 
ON salon_services FOR DELETE USING (user_email = auth.email());
