-- Create technician_schedules table for storing working hours, breaks, etc.
CREATE TABLE technician_schedules (
  id UUID DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES salon_technicians(id) ON DELETE CASCADE,
  user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create table for breaks and time blocks
CREATE TABLE technician_time_blocks (
  id UUID DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES salon_technicians(id) ON DELETE CASCADE,
  user_email TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  block_date DATE,
  day_of_week INTEGER, -- Used for recurring blocks (NULL if one-time)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  block_type TEXT NOT NULL, -- 'break', 'lunch', 'day_off', etc.
  title TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE technician_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_time_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for technician_schedules
CREATE POLICY "Users can view their own technician schedules" 
ON technician_schedules FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert their own technician schedules" 
ON technician_schedules FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own technician schedules" 
ON technician_schedules FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete their own technician schedules" 
ON technician_schedules FOR DELETE USING (user_email = auth.email());

-- Create policies for technician_time_blocks
CREATE POLICY "Users can view their own technician time blocks" 
ON technician_time_blocks FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert their own technician time blocks" 
ON technician_time_blocks FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own technician time blocks" 
ON technician_time_blocks FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete their own technician time blocks" 
ON technician_time_blocks FOR DELETE USING (user_email = auth.email());

-- Create indexes for better performance
CREATE INDEX idx_technician_schedules_technician ON technician_schedules(technician_id);
CREATE INDEX idx_technician_schedules_user_email ON technician_schedules(user_email);
CREATE INDEX idx_technician_schedules_day ON technician_schedules(day_of_week);

CREATE INDEX idx_technician_time_blocks_technician ON technician_time_blocks(technician_id);
CREATE INDEX idx_technician_time_blocks_user_email ON technician_time_blocks(user_email);
CREATE INDEX idx_technician_time_blocks_date ON technician_time_blocks(block_date);
CREATE INDEX idx_technician_time_blocks_day ON technician_time_blocks(day_of_week);
