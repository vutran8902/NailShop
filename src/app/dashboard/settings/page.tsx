"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [salonName, setSalonName] = useState('');
  const [salonAddress, setSalonAddress] = useState('');
  const [salonPhone, setSalonPhone] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user?.email) {
          // Fetch salon settings for this user
          const { data, error } = await supabase
            .from('salon_settings')
            .select('*')
            .eq('user_email', user.email)
            .single();

          if (!error && data) {
            setSalonName(data.name || '');
            setSalonAddress(data.address || '');
            setSalonPhone(data.phone || '');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleSave = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase
        .from('salon_settings')
        .upsert({
          user_email: user.email,
          name: salonName,
          address: salonAddress,
          phone: salonPhone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Salon Settings</h1>
      
      <div className="bg-white/30 dark:bg-purple-900/30 backdrop-blur-lg rounded-xl p-6 shadow-lg max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Salon Name</label>
            <input
              type="text"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-purple-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={salonAddress}
              onChange={(e) => setSalonAddress(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-purple-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={salonPhone}
              onChange={(e) => setSalonPhone(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-purple-800/50"
            />
          </div>

          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
