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

// Define Service type locally or import if defined globally
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

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null; // Service data to edit
  onEditService: (serviceId: string, serviceData: Omit<Service, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function EditServiceModal({ isOpen, onClose, service, onEditService }: EditServiceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when service data changes (modal opens with data)
  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setDescription(service.description || '');
      setDurationMinutes(String(service.duration_minutes) || '');
      setPrice(String(service.price) || '');
    } else {
      // Reset form if no service is provided (e.g., modal closed then reopened without data)
      setName('');
      setDescription('');
      setDurationMinutes('');
      setPrice('');
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service) return; // Should not happen if modal is open with data

    setIsSubmitting(true);
    try {
      await onEditService(service.id, { 
        name, 
        description,
        duration_minutes: parseInt(durationMinutes),
        price: parseFloat(price),
      });
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error("Failed to edit service:", error);
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

  // Don't render the modal if it's not open or no service data is available
  if (!isOpen || !service) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the details for {service.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Duration (minutes)
              </Label>
              <Input
                id="edit-duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
