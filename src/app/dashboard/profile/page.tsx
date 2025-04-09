"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { PostgrestError } from '@supabase/supabase-js';

const ProfilePage = () => {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        if (user) {
          setUserId(user.id);
          setEmail(user.email || '');
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name, phone')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
          }

          if (profile) {
            const nameParts = profile.full_name?.split(' ') || [];
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setPhoneNumber(profile.phone || '');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      setSaveMessage('First name is required');
      return;
    }
    
    try {
      setLoading(true);
      setSaveMessage('');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.email) {
        throw new Error(userError?.message || 'No authenticated user found');
      }
      
      const fullName = `${firstName} ${lastName}`.trim();
      const profileData = {
        email: user.email,
        full_name: fullName,
        phone: phoneNumber,
        updated_at: new Date().toISOString()
      };
      
      // Attempt update first
      // Try to update first
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();
      
      // If no rows were updated (meaning profile didn't exist), insert
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ ...profileData, id: user.id });
          
        if (insertError) {
          const error = insertError as PostgrestError;
          throw new Error(`Failed to create profile: ${error.message}`);
        }
      } else if (updateError) {
        const error = updateError as PostgrestError;
        console.error('Update error details:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      
      // Verify the profile was updated/created
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (fetchError || !updatedProfile) {
        throw new Error('Failed to verify profile update');
      }
      
      setSaveMessage('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile save error:', error);
      setSaveMessage(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        
        {loading && !saveMessage ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                value={email}
                disabled
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {saveMessage && (
              <div className={`p-2 rounded ${saveMessage.includes('Error') || saveMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {saveMessage}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className={`bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
