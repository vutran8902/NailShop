// Script to populate the appointment_schedule table with sample data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Make sure .env.local is properly configured.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate random time between 8:00 AM and 8:00 PM
function getRandomTime(date) {
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // 0, 15, 30, or 45 minutes
  
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Helper function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get a date X days from now
function getDatePlusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function populateSchedule() {
  try {
    console.log('Fetching technicians and services...');
    
    // Get technicians
    const { data: technicians, error: techError } = await supabase
      .from('salon_technicians')
      .select('id, name');
    
    if (techError) {
      throw techError;
    }
    
    if (!technicians || technicians.length === 0) {
      console.error('No technicians found. Please add technicians first.');
      return;
    }
    
    // Get services
    const { data: services, error: serviceError } = await supabase
      .from('salon_services')
      .select('id, name, duration_minutes, price');
    
    if (serviceError) {
      throw serviceError;
    }
    
    if (!services || services.length === 0) {
      console.error('No services found. Please add services first.');
      return;
    }
    
    // Get user email for RLS policies
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw userError;
    }
    
    if (!user || !user.email) {
      console.error('No authenticated user found. Please sign in first.');
      return;
    }
    
    const userEmail = user.email;
    console.log(`Using user email: ${userEmail}`);
    
    // Create sample appointments for the next 7 days
    const appointments = [];
    
    // Sample appointment types
    const appointmentTypes = ['scheduled', 'completed', 'cancelled', 'blocked'];
    const blockTypes = ['custom', 'break', 'lunch', 'meeting'];
    
    // For each day, create 3-5 appointments per technician
    for (let day = 0; day < 7; day++) {
      const date = getDatePlusDays(day);
      
      for (const tech of technicians) {
        // Number of appointments for this technician on this day (3-5)
        const numAppointments = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numAppointments; i++) {
          const isServiceAppointment = Math.random() > 0.3; // 70% chance of service appointment
          const appointmentDate = getRandomTime(date);
          
          if (isServiceAppointment) {
            // Service appointment
            const service = getRandomItem(services);
            
            appointments.push({
              technician_id: tech.id,
              service_id: service.id,
              appointment_date: appointmentDate.toISOString(),
              duration_minutes: service.duration_minutes,
              status: getRandomItem(appointmentTypes),
              notes: `Service appointment with ${tech.name}`,
              block_type: 'appointment',
              title: service.name,
              user_email: userEmail,
              customer_email: userEmail
            });
          } else {
            // Time block
            const blockType = getRandomItem(blockTypes);
            const duration = [15, 30, 45, 60][Math.floor(Math.random() * 4)]; // 15, 30, 45, or 60 minutes
            
            appointments.push({
              technician_id: tech.id,
              appointment_date: appointmentDate.toISOString(),
              duration_minutes: duration,
              status: 'blocked',
              notes: `${blockType} time block`,
              block_type: blockType,
              title: blockType.charAt(0).toUpperCase() + blockType.slice(1), // Capitalize first letter
              user_email: userEmail,
              customer_email: userEmail
            });
          }
        }
      }
    }
    
    console.log(`Generated ${appointments.length} sample appointments`);
    
    // Insert appointments in batches of 50
    const batchSize = 50;
    for (let i = 0; i < appointments.length; i += batchSize) {
      const batch = appointments.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(appointments.length / batchSize)}...`);
      
      const { error } = await supabase
        .from('appointment_schedule')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
      }
    }
    
    console.log('Successfully populated appointment_schedule table with sample data!');
  } catch (error) {
    console.error('Error populating schedule:', error);
  }
}

// Run the function
populateSchedule();
