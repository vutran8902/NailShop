"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTechnician: (techData: Omit<Technician, 'id' | 'is_active' | 'email' | 'user_email'>) => Promise<void>;
}

// Define Technician type locally for the component props
interface Technician {
  id: string;
  email: string;
  user_email: string; // Required field
  name: string;
  specialty: string;
  bio: string;
  is_active: boolean;
}

export function AddTechnicianModal({ isOpen, onClose, onAddTechnician }: AddTechnicianModalProps) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddTechnician({ name, specialty, bio });
      // Reset form and close modal on successful submission (handled in parent)
      setName('');
      setSpecialty('');
      setBio('');
      onClose(); 
    } catch (error) {
      console.error("Failed to add technician:", error);
      // Optionally: show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal state change (e.g., closing via overlay click or escape key)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Optionally reset form state when closing without submitting
      // setName(''); setEmail(''); setSpecialty(''); setBio('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Technician</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Enter the details for the new salon technician.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            {/* Removed Email Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty" className="text-right text-gray-700 dark:text-gray-300">
                Specialty
              </Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right text-gray-700 dark:text-gray-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Adding...' : 'Add Technician'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
