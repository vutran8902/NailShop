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
import * as Select from "@radix-ui/react-select";

interface TechnicianScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: Technician | null;
  schedule?: TechnicianSchedule | null;
  onSaveSchedule: (techId: string, scheduleData: Omit<TechnicianSchedule, 'id' | 'technician_id' | 'user_email' | 'created_at' | 'updated_at'>) => Promise<void>;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  user_email: string;
}

interface TechnicianSchedule {
  id?: string;
  technician_id: string;
  user_email: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
  created_at?: string;
  updated_at?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export function TechnicianScheduleModal({ 
  isOpen, 
  onClose, 
  technician, 
  schedule, 
  onSaveSchedule
}: TechnicianScheduleModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState(1); // Default to Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isWorking, setIsWorking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when schedule data changes (modal opens with data)
  useEffect(() => {
    if (schedule) {
      setDayOfWeek(schedule.day_of_week);
      setStartTime(schedule.start_time);
      setEndTime(schedule.end_time);
      setIsWorking(schedule.is_working);
    } else {
      // Reset form if no schedule is provided
      setDayOfWeek(1);
      setStartTime('09:00');
      setEndTime('17:00');
      setIsWorking(true);
    }
  }, [schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technician) return; // Should not happen if modal is open with data

    setIsSubmitting(true);
    try {
      const scheduleData = {
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_working: isWorking
      };

      await onSaveSchedule(technician.id, scheduleData);
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error("Failed to save schedule:", error);
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
              {schedule ? 'Edit Schedule' : 'Add Schedule'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {schedule 
                ? `Update working hours for ${technician.name}`
                : `Set working hours for ${technician.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day-of-week" className="text-right text-gray-700 dark:text-gray-300">
                Day
              </Label>
              <Select.Root value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-gray-700 dark:text-gray-300">
                Working Day
              </div>
              <div className="col-span-3 flex items-center">
                <input
                  id="is-working"
                  type="checkbox"
                  checked={isWorking}
                  onChange={(e) => setIsWorking(e.target.checked)}
                  className="mr-2"
                />
                <Label htmlFor="is-working" className="text-gray-700 dark:text-gray-300">
                  Available for appointments
                </Label>
              </div>
            </div>
            
            {isWorking && (
              <>
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
                    required={isWorking}
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
                    required={isWorking}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Saving...' : schedule ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
