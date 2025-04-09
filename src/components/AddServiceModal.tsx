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

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (serviceData: Omit<Service, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => Promise<void>;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AddServiceModal({ isOpen, onClose, onAddService }: AddServiceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddService({
        name, 
        description,
        duration_minutes: parseInt(durationMinutes),
        price: parseFloat(price),
      });
      // Reset form and close modal on successful submission (handled in parent)
      setName('');
      setDescription('');
      setDurationMinutes('');
      setPrice('');
      onClose();
    } catch (error: any) {
      console.error("Failed to add service:", error?.message || error);
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
      setName('');
      setDescription('');
      setDurationMinutes('');
      setPrice('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Service</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Enter the details for the new salon service.
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right text-gray-700 dark:text-gray-300">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                step="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-gray-700 dark:text-gray-300">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and single decimal point
                  if (/^\d*\.?\d*$/.test(value)) {
                    setPrice(value);
                  }
                }}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <DialogFooter>
<Button type="button" onClick={onClose} disabled={isSubmitting} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100">
  Cancel
</Button>
<Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
  {isSubmitting ? 'Adding...' : 'Add Service'}
</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
