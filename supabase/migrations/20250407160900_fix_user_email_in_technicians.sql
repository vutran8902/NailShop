-- Check if user_email column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'salon_technicians'
        AND column_name = 'user_email'
    ) THEN
        -- Add user_email column to salon_technicians table
        ALTER TABLE salon_technicians ADD COLUMN user_email TEXT REFERENCES auth.users(email) ON DELETE CASCADE;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_salon_technicians_user_email ON salon_technicians(user_email);
        
        -- Update existing records to use the email field as user_email
        UPDATE salon_technicians SET user_email = email WHERE user_email IS NULL;
    END IF;
END
$$;

-- Recreate policies to ensure they exist
DROP POLICY IF EXISTS "Users can view their own technicians" ON salon_technicians;
DROP POLICY IF EXISTS "Users can insert their own technicians" ON salon_technicians;
DROP POLICY IF EXISTS "Users can update their own technicians" ON salon_technicians;
DROP POLICY IF EXISTS "Users can delete their own technicians" ON salon_technicians;

-- Create policies for salon_technicians
CREATE POLICY "Users can view their own technicians" 
ON salon_technicians FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert their own technicians" 
ON salon_technicians FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own technicians" 
ON salon_technicians FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete their own technicians" 
ON salon_technicians FOR DELETE USING (user_email = auth.email());
