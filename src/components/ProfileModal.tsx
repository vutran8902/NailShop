"use client";

import React, { useState } from 'react';

const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');

  const handleSubmit = () => {
    // Logic to update the profile in Supabase
    console.log('Profile updated:', { firstName, lastName, phoneNumber, currentPlan });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded"
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Current Plan</label>
            <input
              type="text"
              placeholder="Current Plan"
              value={currentPlan}
              onChange={(e) => setCurrentPlan(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
