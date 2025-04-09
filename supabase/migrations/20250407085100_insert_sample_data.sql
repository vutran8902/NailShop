-- Insert sample data for testing

-- Insert sample services
INSERT INTO salon_services (name, description, duration_minutes, price, is_active, user_email)
VALUES
  ('Basic Manicure', 'A classic manicure with nail shaping, cuticle care, and polish.', 30, 25.00, true, 'admin@example.com'),
  ('Gel Manicure', 'Long-lasting gel polish that dries instantly and stays shiny for weeks.', 45, 35.00, true, 'admin@example.com'),
  ('Basic Pedicure', 'Relaxing foot soak, nail shaping, cuticle care, and polish.', 45, 35.00, true, 'admin@example.com'),
  ('Deluxe Pedicure', 'Includes exfoliation, mask, extended massage, and polish.', 60, 50.00, true, 'admin@example.com'),
  ('Acrylic Full Set', 'Full set of acrylic nails with your choice of polish.', 75, 60.00, true, 'admin@example.com'),
  ('Acrylic Fill', 'Maintenance for existing acrylic nails.', 60, 40.00, true, 'admin@example.com'),
  ('Nail Art', 'Custom nail art designs per nail.', 15, 5.00, true, 'admin@example.com'),
  ('Polish Change - Hands', 'Quick polish change without nail shaping or cuticle care.', 15, 15.00, true, 'admin@example.com'),
  ('Polish Change - Feet', 'Quick polish change for toes without nail shaping or cuticle care.', 15, 15.00, true, 'admin@example.com'),
  ('Nail Repair', 'Repair for broken or damaged nails.', 15, 10.00, true, 'admin@example.com');

-- Insert sample technicians
INSERT INTO salon_technicians (name, specialty, bio, is_active, user_email)
VALUES
  ('Emma Johnson', 'Nail Art, Gel Manicures', 'Emma has 5 years of experience specializing in intricate nail art designs.', true, 'admin@example.com'),
  ('Michael Chen', 'Acrylic Nails, Pedicures', 'Michael is known for his precision with acrylic applications and relaxing pedicures.', true, 'admin@example.com'),
  ('Sophia Rodriguez', 'Gel Extensions, Nail Repair', 'Sophia has 7 years of experience and specializes in natural-looking gel extensions.', true, 'admin@example.com'),
  ('David Kim', 'Luxury Pedicures, Hand Treatments', 'David creates a spa-like experience with his signature pedicure techniques.', true, 'admin@example.com'),
  ('Olivia Williams', 'Nail Art, Dip Powder', 'Olivia is an artist at heart who brings creativity to every nail service.', true, 'admin@example.com');

-- Get technician IDs
WITH tech_ids AS (
  SELECT id FROM salon_technicians LIMIT 5
),
-- Get service IDs
service_ids AS (
  SELECT id FROM salon_services LIMIT 10
),
-- Generate dates for the next 7 days
dates AS (
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    INTERVAL '1 day'
  ) AS appointment_date
),
-- Generate time slots between 8 AM and 8 PM
time_slots AS (
  SELECT generate_series(
    8, -- 8 AM
    20, -- 8 PM
    1
  ) AS hour
),
-- Combine dates and times
date_times AS (
  SELECT 
    dates.appointment_date,
    time_slots.hour,
    (dates.appointment_date + (time_slots.hour || ' hours')::INTERVAL) AS appointment_datetime
  FROM dates, time_slots
),
-- Random selection of technicians, services, and date_times
random_selections AS (
  SELECT
    (SELECT id FROM tech_ids ORDER BY random() LIMIT 1) AS technician_id,
    (SELECT id FROM service_ids ORDER BY random() LIMIT 1) AS service_id,
    appointment_datetime,
    (SELECT duration_minutes FROM salon_services WHERE id = (SELECT id FROM service_ids ORDER BY random() LIMIT 1)) AS duration_minutes,
    (ARRAY['scheduled', 'completed', 'cancelled', 'blocked'])[floor(random() * 4 + 1)] AS status,
    'Sample appointment notes' AS notes,
    'appointment' AS block_type,
    (SELECT name FROM salon_services WHERE id = (SELECT id FROM service_ids ORDER BY random() LIMIT 1)) AS title
  FROM date_times
  WHERE random() < 0.3 -- Only create appointments for ~30% of time slots
  LIMIT 50 -- Create 50 random appointments
)
-- Insert appointments
INSERT INTO appointment_schedule (
  technician_id,
  service_id,
  appointment_date,
  duration_minutes,
  status,
  notes,
  block_type,
  title,
  user_email
)
SELECT
  technician_id,
  service_id,
  appointment_datetime,
  duration_minutes,
  status,
  notes,
  block_type,
  title,
  'admin@example.com' as user_email
FROM random_selections;

-- Insert some time blocks (without service_id)
WITH tech_ids AS (
  SELECT id FROM salon_technicians LIMIT 5
),
-- Generate dates for the next 7 days
dates AS (
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    INTERVAL '1 day'
  ) AS block_date
),
-- Generate time slots between 8 AM and 8 PM
time_slots AS (
  SELECT generate_series(
    8, -- 8 AM
    20, -- 8 PM
    1
  ) AS hour
),
-- Combine dates and times
date_times AS (
  SELECT 
    dates.block_date,
    time_slots.hour,
    (dates.block_date + (time_slots.hour || ' hours')::INTERVAL) AS block_datetime
  FROM dates, time_slots
),
-- Random selection of technicians and date_times for blocks
random_blocks AS (
  SELECT
    (SELECT id FROM tech_ids ORDER BY random() LIMIT 1) AS technician_id,
    block_datetime,
    (ARRAY[15, 30, 45, 60])[floor(random() * 4 + 1)] AS duration_minutes,
    'blocked' AS status,
    (ARRAY['Break', 'Lunch', 'Meeting', 'Personal'])[floor(random() * 4 + 1)] AS notes,
    (ARRAY['custom', 'break', 'lunch', 'meeting'])[floor(random() * 4 + 1)] AS block_type,
    (ARRAY['Break Time', 'Lunch Break', 'Staff Meeting', 'Personal Time'])[floor(random() * 4 + 1)] AS title
  FROM date_times
  WHERE random() < 0.15 -- Only create blocks for ~15% of time slots
  LIMIT 25 -- Create 25 random blocks
)
-- Insert time blocks
INSERT INTO appointment_schedule (
  technician_id,
  appointment_date,
  duration_minutes,
  status,
  notes,
  block_type,
  title,
  user_email
)
SELECT
  technician_id,
  block_datetime,
  duration_minutes,
  status,
  notes,
  block_type,
  title,
  'admin@example.com' as user_email
FROM random_blocks;
