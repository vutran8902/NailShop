-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Basic Customers Table (referenced by client_risk view)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE, -- Added UNIQUE constraint, often useful
  email TEXT UNIQUE,
  notes TEXT, -- General notes about the client
  allergies TEXT[], -- Example for allergy tracking
  is_blocked BOOLEAN DEFAULT FALSE, -- For No-Show blocking
  no_show_count INTEGER DEFAULT 0, -- Track number of no-shows
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic Services Table (referenced by sales table)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER, -- Estimated duration
  description TEXT,
  category TEXT, -- e.g., 'Manicure', 'Pedicure', 'Nail Art'
  requires_specialization TEXT[] -- Link to staff specialization
);

-- Staff Table (as provided, added is_active)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialization TEXT[], -- e.g., {"nail art", "pedicures"}
  hourly_rate DECIMAL(10,2),
  commission_rate DECIMAL(5,2), -- e.g., 0.30 for 30% per service
  is_active BOOLEAN DEFAULT TRUE -- To handle staff leaving
);

-- Basic Appointments Table (referenced by sales table and client_risk view)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Keep appointment record even if customer is deleted? Or CASCADE?
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL, -- Assigned staff member
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show', 'in-progress')), -- Added more statuses
  notes TEXT, -- Notes specific to this appointment
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table (as provided - tracks upsells/add-ons)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE, -- If appointment deleted, sale record is less relevant
  add_on_service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- The service that was added on
  sold_by UUID REFERENCES staff(id) ON DELETE SET NULL, -- Track who upsold the service
  sale_time TIMESTAMPTZ DEFAULT NOW(),
  price_at_sale DECIMAL(10, 2) NOT NULL -- Price of the add-on at the time of sale
);

-- Inventory Table (for Smart Inventory Management)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL, -- e.g., "OPI Red #123"
  sku TEXT UNIQUE, -- Stock Keeping Unit, if applicable
  supplier TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  unit_cost DECIMAL(10, 2),
  expiry_date DATE, -- For tracking expiration
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  category TEXT -- e.g., 'Polish', 'Acetone', 'Files'
);

-- Client Risk View (as provided - identify at-risk clients)
-- Note: Assumes 'appointments' table has 'customer_id' and 'start_time'
CREATE OR REPLACE VIEW client_risk AS
SELECT
  c.id,
  c.name,
  c.phone,
  c.email,
  MAX(a.start_time) AS last_visit,
  (NOW()::DATE - MAX(a.start_time)::DATE) AS days_since_last_visit -- Calculate days difference
FROM customers c
LEFT JOIN appointments a ON c.id = a.customer_id AND a.status = 'completed' -- Only consider completed appointments for activity
GROUP BY c.id, c.name, c.phone, c.email -- Include all non-aggregated columns in GROUP BY
HAVING MAX(a.start_time) IS NULL OR (NOW()::DATE - MAX(a.start_time)::DATE) > 60; -- Flag inactive clients (more than 60 days) or clients with no completed appointments


-- Autoclave Sterilization Logs
CREATE TABLE sterilization_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number TEXT UNIQUE NOT NULL, -- Identifier for the sterilization batch
  cycle_start_time TIMESTAMPTZ NOT NULL,
  cycle_end_time TIMESTAMPTZ NOT NULL,
  operator_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Success', 'Failed', 'In Progress')), -- e.g., 'Success', 'Failed'
  expiry_date DATE NOT NULL, -- When the sterilized items expire
  notes TEXT
);

-- Safety Checklists
CREATE TABLE safety_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checklist_type TEXT NOT NULL CHECK (checklist_type IN ('Opening', 'Closing', 'Weekly')), -- e.g., 'Opening', 'Closing'
  completed_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  completion_time TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL -- Store checklist items and their status, e.g., {"sanitized_stations": true, "checked_equipment": false}
);

-- Equipment Maintenance Logs
CREATE TABLE equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_name TEXT NOT NULL, -- e.g., "UV Lamp Station 1"
  serial_number TEXT UNIQUE,
  location TEXT, -- e.g., 'Station 3', 'Sterilization Room'
  maintenance_type TEXT NOT NULL, -- e.g., 'Bulb Replacement', 'Repair', 'Cleaning', 'Calibration'
  maintenance_date DATE NOT NULL,
  performed_by TEXT, -- Could be staff ID or external technician name
  cost DECIMAL(10, 2),
  notes TEXT,
  next_maintenance_due DATE,
  warranty_expiry DATE
);

-- No-Show Tracking Table (Separate table for clarity)
CREATE TABLE no_shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  no_show_time TIMESTAMPTZ DEFAULT NOW(),
  fee_charged DECIMAL(10, 2),
  fee_status TEXT DEFAULT 'pending' CHECK (fee_status IN ('pending', 'paid', 'waived')),
  notes TEXT -- Optional reason if known or notes about fee status
);

-- Function to handle no-show logic
CREATE OR REPLACE FUNCTION handle_no_show(app_id UUID, fee DECIMAL DEFAULT 0.00, block_customer BOOLEAN DEFAULT TRUE)
RETURNS VOID AS $$
DECLARE
  cust_id UUID;
  current_no_show_count INTEGER;
BEGIN
  -- Update appointment status
  UPDATE appointments SET status = 'no-show' WHERE id = app_id RETURNING customer_id INTO cust_id;

  IF cust_id IS NOT NULL THEN
    -- Log the no-show event
    INSERT INTO no_shows (appointment_id, customer_id, fee_charged, fee_status)
    VALUES (app_id, cust_id, fee, CASE WHEN fee > 0 THEN 'pending' ELSE 'waived' END);

    -- Increment no-show count for the customer
    UPDATE customers
    SET no_show_count = no_show_count + 1
    WHERE id = cust_id
    RETURNING no_show_count INTO current_no_show_count;

    -- Block customer if requested (and potentially based on count)
    IF block_customer THEN -- Add logic like: AND current_no_show_count >= 2 THEN
      UPDATE customers SET is_blocked = TRUE WHERE id = cust_id;
    END IF;

    -- Here you might trigger a notification or webhook for payment processing (e.g., Stripe)
    -- PERFORM pg_notify('no_show_occurred', json_build_object('appointment_id', app_id, 'customer_id', cust_id, 'fee', fee)::text);

  END IF;
END;
$$ LANGUAGE plpgsql;


-- Tables for sidebar options
CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT REFERENCES customers(email),
  metrics JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE technician_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT REFERENCES customers(email),
  name TEXT NOT NULL,
  specialization TEXT[],
  bio TEXT,
  rating DECIMAL(3,2),
  schedule JSONB
);

CREATE TABLE appointment_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT REFERENCES customers(email),
  date DATE NOT NULL,
  time_slots JSONB NOT NULL,
  notes TEXT
);

CREATE TABLE service_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT REFERENCES customers(email),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  category TEXT
);

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT REFERENCES customers(email) UNIQUE,
  preferences JSONB NOT NULL,
  notification_settings JSONB
);

-- Indexes for performance
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_inventory_expiry_date ON inventory(expiry_date);
CREATE INDEX idx_inventory_item_name ON inventory(item_name); -- For searching items
CREATE INDEX idx_sales_appointment_id ON sales(appointment_id);
CREATE INDEX idx_sales_sold_by ON sales(sold_by);
CREATE INDEX idx_staff_name ON staff(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_blocked ON customers(is_blocked);
CREATE INDEX idx_sterilization_logs_expiry_date ON sterilization_logs(expiry_date);
CREATE INDEX idx_equipment_maintenance_next_due ON equipment_maintenance(next_maintenance_due);
CREATE INDEX idx_no_shows_customer_id ON no_shows(customer_id);

-- Add comments explaining table purposes and relationships
COMMENT ON TABLE customers IS 'Stores information about salon clients.';
COMMENT ON TABLE services IS 'Defines the services offered by the salon.';
COMMENT ON TABLE staff IS 'Stores information about salon employees.';
COMMENT ON TABLE appointments IS 'Tracks scheduled appointments for clients with staff and services.';
COMMENT ON TABLE sales IS 'Records add-on services sold during appointments (upsells).';
COMMENT ON TABLE inventory IS 'Manages stock levels, costs, and expiry dates of salon products.';
COMMENT ON VIEW client_risk IS 'Identifies clients who have not visited in over 60 days.';
COMMENT ON TABLE sterilization_logs IS 'Tracks sterilization cycles for equipment.';
COMMENT ON TABLE safety_checklists IS 'Logs completion of daily/periodic safety checks.';
COMMENT ON TABLE equipment_maintenance IS 'Records maintenance activities for salon equipment.';
COMMENT ON TABLE no_shows IS 'Logs instances of client no-shows for appointments.';
COMMENT ON FUNCTION handle_no_show IS 'Updates appointment status, logs no-show, increments customer counter, and optionally blocks customer.';
