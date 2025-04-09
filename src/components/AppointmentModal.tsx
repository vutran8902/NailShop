import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TableNames } from '@/lib/tableMapping';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicianId: string;
  technicianName: string;
  date: Date;
  timeSlot: string;
  onSave: (savedEntry: any) => void; 
  onDelete: (deletedEntryId: string) => void; // Added: Callback for deletion
  existingAppointment?: any;
}

export function AppointmentModal({
  isOpen,
  onClose,
  technicianId,
  technicianName,
  date,
  timeSlot,
  onSave,
  onDelete, // Added prop
  existingAppointment
}: AppointmentModalProps) {
  const supabase = createClientComponentClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBlockTime, setIsBlockTime] = useState(false);
  
  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [blockTitle, setBlockTitle] = useState('');
  const [blockDuration, setBlockDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch services and user email
  useEffect(() => {
    const fetchData = async () => {
      // Fetch user email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      // Fetch services
      const { data } = await supabase
        .from('salon_services')
        .select('*')
        .order('name');
      
      if (data) setServices(data);
    };

    fetchData();
  }, [supabase]);

  // Set form values if editing existing appointment & log received data
  useEffect(() => {
    console.log("AppointmentModal received existingAppointment:", existingAppointment); // Log edit data
    if (existingAppointment) {
      if (existingAppointment.service_id) {
        setSelectedServiceId(existingAppointment.service_id);
        setIsBlockTime(false);
      } else {
        setIsBlockTime(true);
        setBlockTitle(existingAppointment.title || '');
        setBlockDuration(existingAppointment.duration_minutes?.toString() || '30');
      }
      setNotes(existingAppointment.notes || '');
    } else {
      // Reset form for new appointment
      setSelectedServiceId('');
      setIsBlockTime(false);
      setBlockTitle('');
      setBlockDuration('30');
      setNotes('');
    }
  }, [existingAppointment]);

  const handleSubmit = async () => {
    console.log('handleSubmit called with timeSlot:', timeSlot, 'blockDuration:', blockDuration);
    if (!timeSlot) {
      alert('Time slot is required');
      return;
    }

    if (!date) {
      alert('Date is required');
      return;
    }

    setLoading(true);
    
    try {
      const timeParts = timeSlot.split(':');
      if (timeParts.length !== 2) {
        throw new Error('Invalid time slot format');
      }

      const [hour, minute] = timeParts.map(Number);
      if (isNaN(hour) || isNaN(minute)) {
        throw new Error('Invalid time slot values');
      }

      const appointmentDate = new Date(date);
      appointmentDate.setHours(hour, minute, 0, 0);
      
      let appointmentData;
      
      if (isBlockTime) {
        console.log('Creating time block with duration:', blockDuration);
        const blockDurationInt = blockDuration ? parseInt(blockDuration) : 30;
        console.log('Parsed block duration:', blockDurationInt);
        
        appointmentData = {
          technician_id: technicianId,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: blockDurationInt,
          status: 'blocked',
          notes: blockTitle || 'Blocked Time',
          block_type: 'custom',
          title: blockTitle || 'Blocked Time',
          user_email: userEmail
        };
      } else {
        const selectedService = services.find(s => s.id === selectedServiceId);
        
        if (!selectedService?.duration_minutes) {
          throw new Error('Selected service not found or has invalid duration');
        }
        
        const serviceMinutes = Number(selectedService.duration_minutes);
        if (isNaN(serviceMinutes) || serviceMinutes <= 0) {
          throw new Error('Service duration must be a positive number');
        }
        
        appointmentData = {
          technician_id: technicianId,
          service_id: selectedServiceId,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: serviceMinutes,
          status: 'scheduled',
          notes: notes,
          block_type: 'appointment',
          title: selectedService.name || 'Appointment',
          user_email: userEmail
        };
      }

      console.log('Submitting appointment data to Supabase:', appointmentData);

      // Perform the insert or update
      const { data: savedEntry, error } = existingAppointment?.id
        ? await supabase
            .from(TableNames.sked)
            .update(appointmentData)
            .eq('id', existingAppointment.id)
            .select() // Select the updated row
            .single()
        : await supabase
            .from(TableNames.sked)
            .insert([appointmentData])
            .select() // Select the inserted row
            .single();

      if (error) {
        console.error("Error saving to Supabase:", error);
        alert(`Supabase error: ${error.message}`);
        throw error; // Rethrow to be caught by outer catch
      }

      console.log('Supabase save successful, entry:', savedEntry);

      // If save was successful, call the onSave callback with the returned data
      if (savedEntry) {
        onSave(savedEntry); // Pass the actual saved data back
        
        // Reset form state for new appointment
        if (!isBlockTime) {
          setSelectedServiceId('');
        } else {
          setBlockTitle('');
          setBlockDuration('30');
        }
        setNotes('');
        
        // Keep the modal open for multiple bookings
        // onClose(); // Commented out to keep the modal open
      } else {
        console.error('Save successful but no data returned from Supabase.');
        alert('Save successful but failed to get updated data. Please refresh.');
      }

    } catch (error: any) {
      // Outer catch handles errors from data prep or Supabase call
      console.error('Error during appointment submission:', error);
      alert(`Failed to save appointment: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string | undefined, durationMinutes: number) => {
    if (!startTime) return '';
    
    const timeParts = startTime.split(':');
    if (timeParts.length !== 2) return '';
    
    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
    
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleDelete = async () => {
    if (!existingAppointment?.id) return;
    
    try {
      setLoading(true);
      
      // Always delete from sked table
      const { error: deleteError } = await supabase
        .from(TableNames.sked)
        .delete()
        .eq('id', existingAppointment.id);

      if (deleteError) throw deleteError; // Throw error if delete fails

      onDelete(existingAppointment.id); // Call parent handler with the ID
      onClose(); // Close modal
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(`Failed to delete: ${(error as Error).message}`); // Show error to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Date & Time</Label>
            <div className="text-sm">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {timeSlot}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Technician</Label>
            <div className="text-sm">{technicianName}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="block-time"
                checked={isBlockTime}
                onChange={() => setIsBlockTime(!isBlockTime)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="block-time">Block time instead of booking service</Label>
            </div>
          </div>
          
          {isBlockTime ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="block-title">Block Title</Label>
                <Input
                  id="block-title"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="Break, Lunch, Meeting, etc."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="block-duration">Duration (minutes)</Label>
                <Input
                  id="block-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={blockDuration || '30'}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  placeholder="30"
                />
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Select
                value={selectedServiceId}
                onValueChange={(value) => {
                  setSelectedServiceId(value);
                  const service = services.find(s => s.id === value);
                  if (service) {
                    // Auto-fill the notes with service info
                    setNotes(`Service: ${service.name} (${service.duration_minutes} min)`);
                  }
                }}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service">
                    {selectedServiceId 
                      ? services.find(s => s.id === selectedServiceId)?.name
                      : ""
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <span className="flex gap-2 text-muted-foreground ml-4">
                          <span className="font-medium">{service.duration_minutes} min</span>
                          <span>-</span>
                          <span>${service.price.toFixed(2)}</span>
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          {existingAppointment && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || (!isBlockTime && !selectedServiceId)}
            >
              {existingAppointment ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
