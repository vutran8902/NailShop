"use client";

import { useState, useEffect } from 'react';
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

// Define Technician type locally or import if defined globally
interface Technician {
  id: string;
  email: string; // Keep email if needed, though not editable here
  user_email: string; // Required field
  name: string;
  specialty: string;
  bio: string;
  is_active: boolean;
}

interface EditTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: Technician | null; // Technician data to edit
  onEditTechnician: (techId: string, techData: Omit<Technician, 'id' | 'is_active' | 'email' | 'user_email' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function EditTechnicianModal({ isOpen, onClose, technician, onEditTechnician }: EditTechnicianModalProps) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when technician data changes (modal opens with data)
  useEffect(() => {
    if (technician) {
      setName(technician.name || '');
      setSpecialty(technician.specialty || '');
      setBio(technician.bio || '');
    } else {
      // Reset form if no technician is provided (e.g., modal closed then reopened without data)
      setName('');
      setSpecialty('');
      setBio('');
    }
  }, [technician]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technician) return; // Should not happen if modal is open with data

    setIsSubmitting(true);
    try {
      await onEditTechnician(technician.id, { name, specialty, bio });
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error("Failed to edit technician:", error);
      // Optionally: show an error message to the user within the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal state change (e.g. closing via overlay click or escape key)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Don't render the modal if it's not open or no technician data is available
  if (!isOpen || !technician) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Technician</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update the details for {technician.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right text-gray-700 dark:text-gray-300">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-specialty" className="text-right text-gray-700 dark:text-gray-300">
                Specialty
              </Label>
              <Input
                id="edit-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-bio" className="text-right text-gray-700 dark:text-gray-300">
                Bio
              </Label>
              <Textarea
                id="edit-bio"
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
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
