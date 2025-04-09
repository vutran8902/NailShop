// Script to insert sample data directly using the Supabase client
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

// Sample data
const services = [
  {
    name: 'Basic Manicure',
    description: 'A classic manicure with nail shaping, cuticle care, and polish.',
    duration_minutes: 30,
    price: 25.00,
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  },
  {
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish that dries instantly and stays shiny for weeks.',
    duration_minutes: 45,
    price: 35.00,
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  },
  {
    name: 'Basic Pedicure',
    description: 'Relaxing foot soak, nail shaping, cuticle care, and polish.',
    duration_minutes: 45,
    price: 35.00,
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  },
  {
    name: 'Deluxe Pedicure',
    description: 'Includes exfoliation, mask, extended massage, and polish.',
    duration_minutes: 60,
    price: 50.00,
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  },
  {
    name: 'Acrylic Full Set',
    description: 'Full set of acrylic nails with your choice of polish.',
    duration_minutes: 75,
    price: 60.00,
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  }
];

const technicians = [
  {
    name: 'Emma Johnson',
    specialty: 'Nail Art, Gel Manicures',
    bio: 'Emma has 5 years of experience specializing in intricate nail art designs.',
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  },
  {
    name: 'Michael Chen',
    specialty: 'Acrylic Nails, Pedicures',
    bio: 'Michael is known for his precision with acrylic applications and relaxing pedicures.',
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  },
  {
    name: 'Sophia Rodriguez',
    specialty: 'Gel Extensions, Nail Repair',
    bio: 'Sophia has 7 years of experience and specializes in natural-looking gel extensions.',
    is_active: true,
    user_email: 'vutran8904@gmail.com'
  }
];

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

async function insertData() {
  try {
    console.log('Inserting services...');
    const { error: servicesError } = await supabase
      .from('salon_services')
      .insert(services);
    
    if (servicesError) {
      console.error('Error inserting services:', servicesError);
    } else {
      console.log(`Successfully added ${services.length} services!`);
    }
    
    console.log('Inserting technicians...');
    const { error: techniciansError } = await supabase
      .from('salon_technicians')
      .insert(technicians);
    
    if (techniciansError) {
      console.error('Error inserting technicians:', techniciansError);
    } else {
      console.log(`Successfully added ${technicians.length} technicians!`);
    }
    
    // Fetch the inserted services and technicians to get their IDs
    const { data: insertedServices } = await supabase
      .from('salon_services')
      .select('id, name, duration_minutes');
    
    const { data: insertedTechnicians } = await supabase
      .from('salon_technicians')
      .select('id, name');
    
    if (!insertedServices || !insertedTechnicians) {
      console.error('Failed to fetch inserted data');
      return;
    }
    
    console.log('Creating appointments...');
    const appointments = [];
    
    // Create appointments for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = getDatePlusDays(day);
      
      // Create 2-3 appointments per technician per day
      for (const tech of insertedTechnicians) {
        const numAppointments = Math.floor(Math.random() * 2) + 2; // 2-3 appointments
        
        for (let i = 0; i < numAppointments; i++) {
          const service = getRandomItem(insertedServices);
          const appointmentDate = getRandomTime(date);
          
          appointments.push({
            technician_id: tech.id,
            service_id: service.id,
            appointment_date: appointmentDate.toISOString(),
            duration_minutes: service.duration_minutes,
            status: 'scheduled',
            notes: `Appointment with ${tech.name} for ${service.name}`,
            block_type: 'appointment',
            title: service.name,
            user_email: 'vutran8904@gmail.com'
          });
        }
        
        // Add 1-2 time blocks per technician per day
        const numBlocks = Math.floor(Math.random() * 2) + 1; // 1-2 blocks
        
        for (let i = 0; i < numBlocks; i++) {
          const blockDate = getRandomTime(date);
          const blockType = getRandomItem(['break', 'lunch', 'meeting']);
          const duration = getRandomItem([15, 30, 45, 60]);
          const title = blockType === 'break' ? 'Break Time' : 
                        blockType === 'lunch' ? 'Lunch Break' : 'Staff Meeting';
          
          appointments.push({
            technician_id: tech.id,
            appointment_date: blockDate.toISOString(),
            duration_minutes: duration,
            status: 'blocked',
            notes: `${blockType} time block`,
            block_type: blockType,
            title: title,
            user_email: 'vutran8904@gmail.com'
          });
        }
      }
    }
    
    console.log(`Generated ${appointments.length} appointments and time blocks`);
    
    // Insert appointments in batches of 20
    const batchSize = 20;
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
    
    console.log('Data insertion complete!');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

// Run the function
insertData();
