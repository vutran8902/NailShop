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
import * as Select from "@radix-ui/react-select";

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: Technician | null;
  timeBlock?: TimeBlock | null;
  onSaveTimeBlock: (techId: string, timeBlockData: Omit<TimeBlock, 'id' | 'technician_id' | 'user_email' | 'created_at' | 'updated_at'>) => Promise<void>;
  date?: Date;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  user_email: string;
}

interface TimeBlock {
  id?: string;
  technician_id: string;
  user_email: string;
  block_date: string | null;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  block_type: string;
  title: string | null;
  notes: string | null;
  is_recurring: boolean;
  created_at?: string;
  updated_at?: string;
}

const BLOCK_TYPES = [
  { value: 'break', label: 'Break' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'day_off', label: 'Day Off' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick_leave', label: 'Sick Leave' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export function TimeBlockModal({ 
  isOpen, 
  onClose, 
  technician, 
  timeBlock, 
  onSaveTimeBlock,
  date
}: TimeBlockModalProps) {
  const [title, setTitle] = useState('');
  const [blockType, setBlockType] = useState('break');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when timeBlock data changes (modal opens with data)
  useEffect(() => {
    if (timeBlock) {
      setTitle(timeBlock.title || '');
      setBlockType(timeBlock.block_type);
      setStartTime(timeBlock.start_time);
      setEndTime(timeBlock.end_time);
      setNotes(timeBlock.notes || '');
      setIsRecurring(timeBlock.is_recurring);
      setDayOfWeek(timeBlock.day_of_week);
    } else {
      // Reset form if no timeBlock is provided
      setTitle('');
      setBlockType('break');
      setStartTime('09:00');
      setEndTime('10:00');
      setNotes('');
      setIsRecurring(false);
      setDayOfWeek(date ? date.getDay() : null);
    }
  }, [timeBlock, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technician) return; // Should not happen if modal is open with data

    setIsSubmitting(true);
    try {
      const timeBlockData = {
        block_date: isRecurring ? null : date ? date.toISOString().split('T')[0] : null,
        day_of_week: isRecurring ? dayOfWeek : null,
        start_time: startTime,
        end_time: endTime,
        block_type: blockType,
        title,
        notes,
        is_recurring: isRecurring
      };

      await onSaveTimeBlock(technician.id, timeBlockData);
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error("Failed to save time block:", error);
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
            <DialogTitle className="text-gray-900 dark:text-white">
              {timeBlock ? 'Edit Time Block' : 'Add Time Block'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {timeBlock 
                ? `Update time block for ${technician.name}`
                : `Add a new time block for ${technician.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-gray-700 dark:text-gray-300">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="Block title (optional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="block-type" className="text-right text-gray-700 dark:text-gray-300">
                Block Type
              </Label>
              <Select.Root value={blockType} onValueChange={setBlockType}>
                <Select.Trigger id="block-type" className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white flex items-center justify-between rounded-md h-9 px-3">
                  <Select.Value />
                  <Select.Icon className="text-gray-500" />
                </Select.Trigger>
                <Select.Content className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <Select.Viewport>
                    {BLOCK_TYPES.map(type => (
                      <Select.Item key={type.value} value={type.value} className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Select.ItemText>{type.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Root>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right text-gray-700 dark:text-gray-300">
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right text-gray-700 dark:text-gray-300">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-gray-700 dark:text-gray-300">
                Recurring
              </div>
              <div className="col-span-3 flex items-center">
                <input
                  id="is-recurring"
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="mr-2"
                />
                <Label htmlFor="is-recurring" className="text-gray-700 dark:text-gray-300">
                  Repeat weekly
                </Label>
              </div>
            </div>
            
            {isRecurring && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day-of-week" className="text-right text-gray-700 dark:text-gray-300">
                  Day of Week
                </Label>
                <Select.Root value={dayOfWeek?.toString() || ''} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
                  <Select.Trigger id="day-of-week" className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white flex items-center justify-between rounded-md h-9 px-3">
                    <Select.Value />
                    <Select.Icon className="text-gray-500" />
                  </Select.Trigger>
                  <Select.Content className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <Select.Viewport>
                      {DAYS_OF_WEEK.map(day => (
                        <Select.Item key={day.value} value={day.value.toString()} className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Select.ItemText>{day.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Root>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-gray-700 dark:text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Saving...' : timeBlock ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
