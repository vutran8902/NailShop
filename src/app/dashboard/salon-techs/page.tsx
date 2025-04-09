"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState, useCallback } from 'react';
import { AddTechnicianModal } from '@/components/AddTechnicianModal';
import { EditTechnicianModal } from '@/components/EditTechnicianModal';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Technician {
  id: string;
  email: string;
  user_email: string;
  name: string;
  specialty: string;
  bio: string;
  is_active: boolean;
}

export default function SalonTechsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch technicians - extracted to be reusable
  const fetchTechnicians = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setError(null);
    
    try {
      // Get current user's email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user?.email) {
        throw new Error('No authenticated user found. Please sign in.');
      }
      
      // Store user email for later use
      setUserEmail(user.email);
      
      // Fetch technicians filtered by user's email
      let { data, error: fetchError } = await supabase
        .from('salon_technicians')
        .select('*')
        .eq('user_email', user.email)
        .order('name', { ascending: true });
      
      if (fetchError && fetchError.message.includes('user_email does not exist')) {
        // If user_email column doesn't exist, show error
        setError('The user_email column is missing. Please run "npm run fix-technicians" to fix this issue.');
      } else if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // If there's an error about user_email column not existing, try fetching by email instead
      if (fetchError && fetchError.message.includes('user_email does not exist')) {
        console.log('user_email column does not exist, trying to fetch by email...');
        
        // Fetch by email as fallback
        const { data: emailData, error: emailFetchError } = await supabase
          .from('salon_technicians')
          .select('*')
          .eq('email', user.email)
          .order('name', { ascending: true });
        
        if (emailFetchError) {
          throw new Error(`Database error: ${emailFetchError.message}`);
        }
        
        data = emailData;
        
        // Show error message about missing column
        setError('The user_email column is missing. Please run "npm run fix-technicians" to fix this issue.');
      } else if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }
      
      console.log('Fetched technicians:', data);
      
      // Add user_email property to each technician if it doesn't exist
      const techniciansWithUserEmail = (data || []).map(tech => ({
        ...tech,
        user_email: tech.user_email || tech.email
      }));
      
      setTechnicians(techniciansWithUserEmail);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setError((error as Error).message || 'Failed to load technicians');
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, [supabase]);

  // Initial data fetch
  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('salon_technicians')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      setTechnicians(technicians.map(tech => 
        tech.id === id ? { ...tech, is_active: !isActive } : tech
      ));
    } catch (error) {
      console.error('Error updating technician:', error);
    }
  };

  // Function to handle adding a new technician from the modal
  const handleAddTechnicianSubmit = async (techData: Omit<Technician, 'id' | 'is_active' | 'email' | 'user_email'>) => {
    console.log("Adding technician with data:", techData);
    setError(null); // Clear previous errors
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.email) throw new Error('No authenticated user found');

      const insertData = {
        ...techData,
        user_email: user.email, // Use the correct column name
        is_active: true
      };

      console.log("Attempting to insert:", insertData);

      const { data: newTechnician, error: insertError } = await supabase
        .from('salon_technicians')
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        if (insertError.message.includes("column \"user_email\" of relation \"salon_technicians\" does not exist")) {
          setError('The user_email column is missing in the database. Please run database migrations.');
          throw new Error('Missing user_email column');
        } else {
          throw insertError; // Throw other Supabase errors
        }
      }

      console.log("Technician added:", newTechnician);

      if (newTechnician) {
        // Ensure the returned data includes user_email, fallback if necessary (though unlikely with correct insert)
        const techWithUserEmail = {
          ...newTechnician,
          user_email: newTechnician.user_email || user.email // Use inserted email as fallback
        };
        setTechnicians(prev => [...prev, techWithUserEmail].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsAddModalOpen(false);
    } catch (error) {
      const message = (error as Error).message || 'An unknown error occurred';
      console.error('Error adding technician:', message);
      console.error('Full error object:', error);
      setError(`Failed to add technician: ${message}`); // Set error state for UI display
      // Do not rethrow here if error is handled by setting state
    }
  };

  // Function to handle opening the edit modal
  const handleEditClick = (technician: Technician) => {
    setEditingTechnician(technician);
    setIsEditModalOpen(true);
  };

  // Function to handle submitting the edit form
  const handleEditTechnicianSubmit = async (techId: string, techData: Omit<Technician, 'id' | 'is_active' | 'email' | 'user_email' | 'created_at' | 'updated_at'>) => {
    setError(null); // Clear previous errors
    try {
      const existingTech = technicians.find(tech => tech.id === techId);
      if (!existingTech) throw new Error('Technician not found');

      // Prepare data for update, ensuring only valid columns are included
      const updateData = {
        ...techData,
        // user_email should not be updated here unless explicitly intended
        // user_email: existingTech.user_email, // Keep original user_email
        updated_at: new Date().toISOString()
      };

      console.log("Attempting to update technician", techId, "with:", updateData);

      const { data: updatedTechnician, error: updateError } = await supabase
        .from('salon_technicians')
        .update(updateData)
        .eq('id', techId)
        .select()
        .single();

      if (updateError) {
         if (updateError.message.includes("column \"user_email\" of relation \"salon_technicians\" does not exist")) {
             setError('The user_email column is missing in the database. Please run database migrations.');
             throw new Error('Missing user_email column');
         } else {
            throw updateError; // Throw other Supabase errors
         }
      }

      if (updatedTechnician) {
        // Ensure the returned data includes user_email
        const techWithUserEmail = {
          ...updatedTechnician,
          user_email: updatedTechnician.user_email || existingTech.user_email // Use existing as fallback
        };
        setTechnicians(prev => prev.map(tech =>
          tech.id === techId ? techWithUserEmail : tech
        ).sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsEditModalOpen(false);
      setEditingTechnician(null);
    } catch (error) {
      const message = (error as Error).message || 'An unknown error occurred';
      console.error('Error editing technician:', message);
      setError(`Failed to edit technician: ${message}`); // Set error state for UI display
      // Do not rethrow here if error is handled by setting state
    }
  };

  // Function to handle deleting a technician
  const handleDeleteClick = async (techId: string) => {
    // Simple confirmation dialog
    if (window.confirm("Are you sure you want to delete this technician? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('salon_technicians')
          .delete()
          .eq('id', techId);

        if (error) throw error;

        // Remove the technician from the local state
        setTechnicians(technicians.filter(tech => tech.id !== techId));
        console.log('Technician deleted successfully:', techId);

      } catch (error) {
        console.error('Error deleting technician:', (error as Error).message || error);
        // Optionally: show an error notification to the user
        alert("Failed to delete technician. Please check console for details.");
      }
    }
  };


  if (loading) return <div className="p-4">Loading technicians...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-3">All Technicians ({technicians.length})</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchTechnicians(true)} 
            disabled={refreshing}
            title="Refresh technicians"
            className="h-8 w-8"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAddModalOpen(true)} // Open the Add modal
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            + Add New
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Technician Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {technicians.map((tech) => (
          <div key={tech.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center mb-4">
              {/* Placeholder Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-4 text-xl font-bold text-gray-500 dark:text-gray-400">
                {tech.name?.charAt(0).toUpperCase()} 
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{tech.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tech.specialty || 'Technician'}</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="space-y-2 mb-4 flex-grow">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {/* Display Bio */}
                <p className="line-clamp-3">{tech.bio || 'No bio available.'}</p> 
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex justify-end items-center space-x-2">
               {/* Edit Button */}
               <button
                 onClick={() => handleEditClick(tech)} // Open Edit modal
                 className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                 aria-label="Edit Technician"
               >
                 <Pencil size={16} />
               </button>
               {/* Delete Button */}
               <button
                 onClick={() => handleDeleteClick(tech.id)} // Call delete handler
                 className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                 aria-label="Delete Technician"
               >
                 <Trash2 size={16} />
               </button>
               {/* Status Button */}
               <button
                 onClick={() => handleToggleActive(tech.id, tech.is_active)}
                 className={`px-3 py-1 rounded-md text-xs font-medium min-w-[60px] text-center ${
                   tech.is_active 
                     ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-800/50' 
                     : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/50'
                 }`}
               >
                 {tech.is_active ? 'Active' : 'Inactive'}
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render the Add Technician Modal */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTechnician={handleAddTechnicianSubmit}
      />

      {/* Render the Edit Technician Modal */}
      <EditTechnicianModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTechnician(null); // Clear editing state on close
        }}
        technician={editingTechnician}
        onEditTechnician={handleEditTechnicianSubmit}
      />
    </div>
  );
}
