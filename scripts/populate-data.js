// Script to populate the salon_services and salon_technicians tables with sample data
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

async function populateData() {
  try {
    console.log('Getting user email...');
    
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
    
    // Sample services
    const services = [
      {
        name: 'Basic Manicure',
        description: 'A classic manicure with nail shaping, cuticle care, and polish.',
        duration_minutes: 30,
        price: 25.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Gel Manicure',
        description: 'Long-lasting gel polish that dries instantly and stays shiny for weeks.',
        duration_minutes: 45,
        price: 35.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Basic Pedicure',
        description: 'Relaxing foot soak, nail shaping, cuticle care, and polish.',
        duration_minutes: 45,
        price: 35.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Deluxe Pedicure',
        description: 'Includes exfoliation, mask, extended massage, and polish.',
        duration_minutes: 60,
        price: 50.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Acrylic Full Set',
        description: 'Full set of acrylic nails with your choice of polish.',
        duration_minutes: 75,
        price: 60.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Acrylic Fill',
        description: 'Maintenance for existing acrylic nails.',
        duration_minutes: 60,
        price: 40.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Nail Art',
        description: 'Custom nail art designs per nail.',
        duration_minutes: 15,
        price: 5.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Polish Change - Hands',
        description: 'Quick polish change without nail shaping or cuticle care.',
        duration_minutes: 15,
        price: 15.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Polish Change - Feet',
        description: 'Quick polish change for toes without nail shaping or cuticle care.',
        duration_minutes: 15,
        price: 15.00,
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Nail Repair',
        description: 'Repair for broken or damaged nails.',
        duration_minutes: 15,
        price: 10.00,
        is_active: true,
        user_email: userEmail
      }
    ];
    
    // Sample technicians
    const technicians = [
      {
        name: 'Emma Johnson',
        specialty: 'Nail Art, Gel Manicures',
        bio: 'Emma has 5 years of experience specializing in intricate nail art designs.',
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Michael Chen',
        specialty: 'Acrylic Nails, Pedicures',
        bio: 'Michael is known for his precision with acrylic applications and relaxing pedicures.',
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Sophia Rodriguez',
        specialty: 'Gel Extensions, Nail Repair',
        bio: 'Sophia has 7 years of experience and specializes in natural-looking gel extensions.',
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'David Kim',
        specialty: 'Luxury Pedicures, Hand Treatments',
        bio: 'David creates a spa-like experience with his signature pedicure techniques.',
        is_active: true,
        user_email: userEmail
      },
      {
        name: 'Olivia Williams',
        specialty: 'Nail Art, Dip Powder',
        bio: 'Olivia is an artist at heart who brings creativity to every nail service.',
        is_active: true,
        user_email: userEmail
      }
    ];
    
    // Insert services
    console.log('Inserting services...');
    const { error: servicesError } = await supabase
      .from('salon_services')
      .insert(services);
    
    if (servicesError) {
      console.error('Error inserting services:', servicesError);
    } else {
      console.log(`Successfully added ${services.length} services!`);
    }
    
    // Insert technicians
    console.log('Inserting technicians...');
    const { error: techniciansError } = await supabase
      .from('salon_technicians')
      .insert(technicians);
    
    if (techniciansError) {
      console.error('Error inserting technicians:', techniciansError);
    } else {
      console.log(`Successfully added ${technicians.length} technicians!`);
    }
    
    console.log('Data population complete!');
  } catch (error) {
    console.error('Error populating data:', error);
  }
}

// Run the function
populateData();
