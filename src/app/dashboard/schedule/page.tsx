"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState, useMemo } from 'react';
import { TableNames } from '@/lib/tableMapping';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppointmentModal } from "@/components/AppointmentModal";
import { ChevronLeft, ChevronRight, Filter, Plus, MoreVertical, Search, Calendar } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string; 
  duration_minutes: number;
}

interface TimeBlock {
  id: string;
  technician_id: string;
  title: string;
  start_time: string;
  end_time: string;
  block_type: string;
  service_id?: string; 
  duration_minutes?: number; 
  appointment_date: string;
}

// --- Color Logic ---
const technicianColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 
  'bg-teal-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500',
  'bg-gray-500'
];
const technicianColorMap = new Map<string, string>();
let colorIndex = 0;

// Helper function to get block color class based on technician and theme
const getBlockColorClass = (technicianId: string, isDark: boolean): string => {
  if (!technicianColorMap.has(technicianId)) {
    technicianColorMap.set(technicianId, technicianColors[colorIndex % technicianColors.length]);
    colorIndex++;
  }
  const baseColor = technicianColorMap.get(technicianId)!;
  return `${baseColor} text-white hover:${baseColor}/90 transition-colors`;
};
// --- End Color Logic ---


export default function SchedulePage() {
  const supabase = createClientComponentClient();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  // Initialize selectedTechs from localStorage or empty array
  const [selectedTechs, setSelectedTechs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedTechnicians');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [selectedTechName, setSelectedTechName] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [timeInterval, setTimeInterval] = useState<number>(15); // Default to 15 minutes
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check dark mode on mount and theme change
   useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    // Optional: Add listener for theme changes if using a dynamic theme toggle
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Get logged in user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
      }
    };
    
    getUser();
  }, [supabase]);

  // Fetch technicians and services
  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;
      
      const { data: techs } = await supabase
        .from('salon_technicians')
        .select('id, name')
        .eq('user_email', userEmail);
        
      const { data: svcs } = await supabase  
        .from('salon_services')
        .select('id, name, duration_minutes')
        .eq('user_email', userEmail);

      if (techs) setTechnicians(techs);
      if (svcs) setServices(svcs);
    };

    fetchData();
  }, [supabase, userEmail]);

  // Fetch data from the sked table for the next 90 days
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!userEmail) return; // Ensure userEmail is available

      const today = new Date();
      const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Fetch all schedule entries (both appointments and blocks) for the user's email within the next 90 days
      const { data: scheduleEntries, error } = await supabase
        .from(TableNames.sked)
        .select('*')
        .eq('user_email', userEmail)
        .gte('appointment_date::date', today.toISOString().split('T')[0])
        .lte('appointment_date::date', ninetyDaysLater.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching schedule data:', error);
        return;
      }

      console.log(`Fetched ${scheduleEntries?.length || 0} entries between ${today.toISOString().split('T')[0]} and ${ninetyDaysLater.toISOString().split('T')[0]}:`, scheduleEntries);

      // Format data for display
      const formattedBlocks: TimeBlock[] = [];

      if (scheduleEntries) {
        for (const entry of scheduleEntries) {
          const startDate = new Date(entry.appointment_date);
          const startTime = startDate.toTimeString().substring(0, 5);
          const endDate = new Date(startDate.getTime() + entry.duration_minutes * 60000);
          const endTime = endDate.toTimeString().substring(0, 5);

          formattedBlocks.push({
            id: entry.id,
            technician_id: entry.technician_id,
            title: entry.title || (entry.service_id ? 'Appointment' : 'Blocked'),
            start_time: startTime,
            end_time: endTime,
            block_type: entry.block_type || (entry.service_id ? 'appointment' : 'custom'),
            service_id: entry.service_id || null,
            duration_minutes: entry.duration_minutes,
            appointment_date: entry.appointment_date
          });
        }
      }

      setTimeBlocks(formattedBlocks);
      console.log("Formatted blocks set in state:", formattedBlocks);
    };

    console.log("useEffect triggered: Fetching schedule data...");
    fetchScheduleData();
  }, [supabase, userEmail]);

  // Update localStorage whenever selectedTechs changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTechnicians', JSON.stringify(selectedTechs));
    }
  }, [selectedTechs]);

  const handleTechToggle = (techId: string) => {
    setSelectedTechs(prev => {
      const newSelection = prev.includes(techId)
        ? prev.filter(id => id !== techId)
        : [...prev, techId];
      // The useEffect above will handle saving to localStorage
      return newSelection;
    });
  };

  // Helper function to convert HH:MM time to minutes since midnight
  const timeToMinutes = (timeStr: string): number | null => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
      return null;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return hours * 60 + minutes;
  };

  const getCoveringBlockForSlot = (techId: string, timeSlot: string, blocks: TimeBlock[]): TimeBlock | null => {
    const slotMinutes = timeToMinutes(timeSlot);
    if (slotMinutes === null) return null;

    for (const block of blocks) {
      if (block.technician_id === techId) {
        const startMinutes = timeToMinutes(block.start_time);
        const endMinutes = timeToMinutes(block.end_time);

        if (startMinutes !== null && endMinutes !== null && startMinutes < endMinutes) {
           // Check if the slot's start time falls within the block's duration
           // A slot is covered if its start time is >= block start AND < block end
           if (slotMinutes >= startMinutes && slotMinutes <= endMinutes) {
             // console.log(`Slot ${timeSlot} (${slotMinutes}) IS covered by block ${block.id} (${block.start_time}-${block.end_time} / ${startMinutes}-${endMinutes})`);
             return block;
           }
        } else {
           // Log invalid block times if necessary
           // console.warn(`Invalid time format or range for block ${block.id}: ${block.start_time} - ${block.end_time}`);
        }
      }
    }
    return null;
  };

  const formatTimeBlock = (blockData: any): TimeBlock => {
    if (!blockData || !blockData.appointment_date) {
      console.error('Invalid block data received:', blockData);
      throw new Error('Invalid block data: appointment_date is required');
    }
    
    const startDate = new Date(blockData.appointment_date);
    const startTime = startDate.toTimeString().substring(0, 5);
    const endDate = new Date(startDate.getTime() + blockData.duration_minutes * 60000);
    const endTime = endDate.toTimeString().substring(0, 5);

    return {
      id: blockData.id,
      technician_id: blockData.technician_id,
      title: blockData.title || 'Blocked',
      start_time: startTime,
      end_time: endTime,
      block_type: blockData.block_type || 'custom',
      service_id: blockData.service_id || null,
      duration_minutes: blockData.duration_minutes,
      appointment_date: blockData.appointment_date
    };
  };

  const isTimeSlotAvailable = (timeSlot: string, techId: string, blocks: TimeBlock[]) => {
    // A slot is available if no block covers it
    return getCoveringBlockForSlot(techId, timeSlot, blocks) === null;
  };

  // Generate time slots from 8:00 AM to 11:00 PM based on selected interval
  const timeSlots = useMemo(() => {
    const startHour = 8;
  const endHour = 23; // 11 PM
  const totalMinutes = (endHour - startHour + 1) * 60; 
  const slots = [];
    
  for (let minutes = 0; minutes <= totalMinutes - timeInterval; minutes += timeInterval) {
    const hour = Math.floor(minutes / 60) + startHour;
    const min = minutes % 60;
    const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
    // Check if this time slot is available based on service durations
    let isAvailable = true;
    const dateStr = currentDate.toISOString().split('T')[0];
    const filteredTimeBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.appointment_date);
      return blockDate.toISOString().split('T')[0] === dateStr;
    });

    if (selectedTechs.length > 0) {
      isAvailable = selectedTechs.some(techId => isTimeSlotAvailable(time, techId, filteredTimeBlocks));
    }

    if (isAvailable) {
      slots.push(time);
    }
  }

  return slots;
}, [timeInterval, selectedTechs, currentDate, timeBlocks]);

  // Calendar navigation
  const prevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Handle time slot click
  const handleTimeSlotClick = (timeSlot: string, techId: string) => {
    console.log('Time slot clicked:', timeSlot, 'for tech:', techId);
    const dateStr = currentDate.toISOString().split('T')[0];
    const filteredTimeBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.appointment_date);
      if (isNaN(blockDate.getTime())) return false; // Skip invalid dates
      return blockDate.toISOString().split('T')[0] === dateStr;
    });

    const tech = technicians.find(t => t.id === techId);
    if (tech && isTimeSlotAvailable(timeSlot, techId, filteredTimeBlocks)) {
      console.log('Setting selected time slot to:', timeSlot);
      setSelectedTimeSlot(timeSlot);
      setSelectedTechId(techId);
      setSelectedTechName(tech.name);
      setEditingAppointment(null);
      setModalOpen(true);
    } else {
      console.log('Slot not available or tech not found');
    }
  };

  // Handle time block click
  const handleTimeBlockClick = (block: TimeBlock) => {
    const tech = technicians.find(t => t.id === block.technician_id);
    if (tech) {
      setSelectedTimeSlot(block.start_time);
      setSelectedTechId(block.technician_id);
      setSelectedTechName(tech.name);
      setEditingAppointment({
        id: block.id,
        title: block.title,
        block_type: block.block_type,
        start_time: block.start_time,
        end_time: block.end_time
      });
      setModalOpen(true);
    }
  };

  // Update local state after appointment/block is deleted
  const handleDeleteAppointment = (deletedEntryId: string) => {
    console.log("Deleting entry from local state:", deletedEntryId);
    setTimeBlocks(prev => prev.filter(block => block.id !== deletedEntryId));
  };

  // Update local state after appointment/block is saved in the modal
  const handleSaveAppointment = (savedEntry: any) => {
    console.log("Received saved entry in SchedulePage:", savedEntry);
    if (!savedEntry) {
        console.error("handleSaveAppointment received null or undefined entry");
        return;
    }
    try {
      // Format the data returned from Supabase (via the modal's onSave)
      const formattedSavedBlock = formatTimeBlock(savedEntry); 
      console.log("Formatted block for state update:", formattedSavedBlock);

      setTimeBlocks(prevTimeBlocks => {
        const existingIndex = prevTimeBlocks.findIndex(block => block.id === formattedSavedBlock.id);
        let updatedBlocks;

        if (existingIndex !== -1) {
          // Update existing block
          console.log("Updating existing block in state:", formattedSavedBlock.id);
          updatedBlocks = [...prevTimeBlocks];
          updatedBlocks[existingIndex] = formattedSavedBlock;
        } else {
          // Add new block
          console.log("Adding new block to state");
          updatedBlocks = [...prevTimeBlocks, formattedSavedBlock];
        }
        
        // Sort blocks by start time
        return updatedBlocks.sort((a, b) => a.start_time.localeCompare(b.start_time));
      });
    } catch (error) {
      console.error('Error updating local schedule state:', error);
      // Optionally show an error to the user if state update fails
      alert('Failed to update the schedule display. Please refresh the page.');
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDay = new Date(currentYear, currentMonth, 0 - (startingDay - i - 1));
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: 
          date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() && 
          date.getFullYear() === today.getFullYear(),
        isSelected:
          date.getDate() === currentDate.getDate() && 
          date.getMonth() === currentDate.getMonth() && 
          date.getFullYear() === currentDate.getFullYear()
      });
    }
    
    // Next month days to fill out the calendar
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex h-screen p-4 gap-4">
      {/* Left Panel */}
      <div className="w-1/3 flex flex-col gap-4 overflow-y-auto max-h-screen">
        {/* Calendar */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="sm" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="ghost" size="sm" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`text-center p-2 text-sm cursor-pointer ${
                  day.isCurrentMonth ? '' : 'text-gray-400 dark:text-gray-600'
                } ${day.isSelected ? 'bg-blue-100 dark:bg-blue-900/20 rounded-md' : ''}`}
                onClick={() => setCurrentDate(day.date)}
              >
                {day.date.getDate()}
              </div>
            ))}
          </div>
        </div>

        {/* Technician Selection */}
        <div className="border rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Technicians</h2>
          <div className="flex flex-col gap-2">
            {technicians.map(tech => (
              <div key={tech.id} className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    selectedTechs.includes(tech.id) ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <button 
                  onClick={() => handleTechToggle(tech.id)}
                  className="text-sm border-none bg-transparent cursor-pointer"
                >
                  {tech.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Time Interval Selection */}
        <div className="border rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Time Interval</h2>
          <select
            value={timeInterval}
            onChange={(e) => setTimeInterval(Number(e.target.value))}
            className="w-full p-2 border rounded-lg"
          >
            <option value={5}>5 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </div>
      </div>

      {/* Right Panel - Schedule Grid */}
      <div className="w-2/3 border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="text-lg font-medium">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-lg font-medium">
            Time Interval: {timeInterval} minutes
          </div>
        </div>
        <div className="grid border-b" style={{ gridTemplateColumns: `100px repeat(${selectedTechs.length}, 1fr)` }}>
          <div className="p-2 font-medium border-r">Time</div>
          {selectedTechs.map(techId => {
            const tech = technicians.find(t => t.id === techId);
            if (!tech) return null; // Skip if technician not found
            return (
              <div key={techId} className="p-2 font-medium text-center border-r">
                {tech.name}
              </div>
            );
          })}
        </div>
        
        {/* Time Slots with Scroll */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {timeSlots.map(timeSlot => {
            const dateStr = currentDate.toISOString().split('T')[0];
            const filteredTimeBlocks = timeBlocks.filter(block => {
              const blockDate = new Date(block.appointment_date);
              return blockDate.toISOString().split('T')[0] === dateStr;
            });

            return (
              <div key={timeSlot} className="grid border-b hover:bg-gray-50 dark:hover:bg-gray-800" style={{ gridTemplateColumns: `100px repeat(${selectedTechs.length}, 1fr)` }}>
                <div className="p-2 border-r text-sm">{timeSlot}</div>
                {selectedTechs.map(techId => {
                  const tech = technicians.find(t => t.id === techId);
                  if (!tech) return null; // Skip if technician not found
                  
                  const coveringBlock = getCoveringBlockForSlot(techId, timeSlot, filteredTimeBlocks);
                  
                  if (coveringBlock) {
                    return (
                      <div 
                        key={`${techId}-${timeSlot}`} 
                        className={`p-2 cursor-pointer ${getBlockColorClass(techId, isDarkMode)} border-r`}
                        onClick={() => handleTimeBlockClick(coveringBlock)}
                      >
                        <div className="text-sm font-medium">{coveringBlock.title}</div>
                        <div className="text-xs">{coveringBlock.start_time} - {coveringBlock.end_time}</div>
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        key={`${techId}-${timeSlot}`} 
                        className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-r"
                        onClick={() => handleTimeSlotClick(timeSlot, techId)}
                      >
                        <div className="flex justify-center items-center h-full">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Modal */}
      {modalOpen && (
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          technicianId={selectedTechId}
          technicianName={selectedTechName}
          date={currentDate}
          timeSlot={selectedTimeSlot}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
          existingAppointment={editingAppointment}
        />
      )}
    </div>
  );
}
