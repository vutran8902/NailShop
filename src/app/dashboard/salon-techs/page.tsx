"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SalonTech {
  id?: string;
  name: string;
  specialization: string[];
  hourly_rate: number;
  commission_rate: number;
  profile_image_url?: string;
  is_active: boolean;
}

export default function SalonTechsPage() {
  const [techs, setTechs] = useState<SalonTech[]>([]);
  const [newTech, setNewTech] = useState<Partial<SalonTech>>({
    name: '',
    specialization: [],
    hourly_rate: 0,
    commission_rate: 0,
    is_active: true
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingTech, setIsAddingTech] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        const { data: techsData, error } = await supabase
          .from('staff')
          .select('*')
          .order('name');

        if (error) throw error;

        setTechs(techsData || []);
      } catch (error) {
        console.error('Error fetching salon techs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechs();
  }, [supabase, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const uploadProfileImage = async (techId: string) => {
    if (!profileImage) return null;

    try {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${techId}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('staff_profiles')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('staff_profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  };

  const handleAddTech = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert new tech
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: newTech.name,
          specialization: newTech.specialization,
          hourly_rate: newTech.hourly_rate,
          commission_rate: newTech.commission_rate,
          is_active: newTech.is_active
        })
        .select()
        .single();

      if (error) throw error;

      // Upload profile image if selected
      let profileImageUrl = null;
      if (profileImage) {
        profileImageUrl = await uploadProfileImage(data.id);
      }

      // Update tech with profile image URL if uploaded
      if (profileImageUrl) {
        await supabase
          .from('staff')
          .update({ profile_image_url: profileImageUrl })
          .eq('id', data.id);
        data.profile_image_url = profileImageUrl;
      }

      // Update local state
      setTechs([...techs, data]);
      
      // Reset form
      setNewTech({
        name: '',
        specialization: [],
        hourly_rate: 0,
        commission_rate: 0,
        is_active: true
      });
      setProfileImage(null);
      setIsAddingTech(false);
    } catch (error) {
      console.error('Error adding tech:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Salon Technicians</h1>
        <button 
          onClick={() => setIsAddingTech(!isAddingTech)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          {isAddingTech ? 'Cancel' : '+ Add Technician'}
        </button>
      </div>

      {isAddingTech && (
        <form onSubmit={handleAddTech} className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Technician Name
                <input
                  type="text"
                  value={newTech.name || ''}
                  onChange={(e) => setNewTech({...newTech, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Specialization
                <input
                  type="text"
                  value={newTech.specialization?.join(', ') || ''}
                  onChange={(e) => setNewTech({...newTech, specialization: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="Nail Art, Pedicure, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Hourly Rate
                <input
                  type="number"
                  value={newTech.hourly_rate || 0}
                  onChange={(e) => setNewTech({...newTech, hourly_rate: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  step="0.01"
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Commission Rate
                <input
                  type="number"
                  value={newTech.commission_rate || 0}
                  onChange={(e) => setNewTech({...newTech, commission_rate: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  step="0.01"
                  max="1"
                />
              </label>
            </div>
            <div className="col-span-full">
              <label className="block text-gray-700 font-bold mb-2">
                Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-teal-100"
                />
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              type="submit" 
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Add Technician
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {techs.map((tech) => (
          <div 
            key={tech.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105"
          >
            <div className="relative h-48 w-full">
              <img 
                src={tech.profile_image_url || '/default-profile.png'} 
                alt={tech.name} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tech.name}</h3>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Specialties:</strong> {tech.specialization?.join(', ') || 'N/A'}
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Hourly Rate: ${tech.hourly_rate.toFixed(2)}</span>
                <span>Commission: {(tech.commission_rate * 100).toFixed(0)}%</span>
              </div>
              <div className="mt-4">
                <span 
                  className={`px-3 py-1 rounded-full text-xs ${
                    tech.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tech.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
