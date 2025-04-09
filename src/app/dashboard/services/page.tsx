"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { AddServiceModal } from '@/components/AddServiceModal';
import { EditServiceModal } from '@/components/EditServiceModal';
import { Pencil, Trash2 } from 'lucide-react'; // Import icons
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from '@supabase/supabase-js';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export default function ServicesPage() {
  const supabase = createClientComponentClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user?.email) {
          // Fetch services for this user
          const { data, error } = await supabase
            .from('salon_services')
            .select('*')
            .eq('user_email', user.email);

          if (error) {
            console.error('Error fetching services:', error);
          }

          if (data) {
            setServices(data);
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

  const handleAddServiceSubmit = async (serviceData: Omit<Service, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'user_email' >) => {
    try {
      if (!user?.email) {
        console.error("User email not found.");
        return;
      }

      const { data, error } = await supabase
        .from('salon_services')
        .insert([{ ...serviceData, is_active: true, user_email: user.email }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setServices([...services, data]);
      }
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding service:', error?.message || error);
    }
  };

  const handleEditClick = async (service: Service) => {
    setEditingService(service);
    setIsEditModalOpen(true);
  };

  const handleEditServiceSubmit = async (serviceId: string, serviceData: Omit<Service, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'user_email'>) => {
    try {
      const { data, error } = await supabase
        .from('salon_services')
        .update(serviceData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setServices(services.map(service =>
          service.id === serviceId ? { ...service, ...data } : service
        ));
      }
      setIsEditModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error editing service:', error);
    }
  };

  const handleDeleteClick = async (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('salon_services')
          .delete()
          .eq('id', serviceId);

        if (error) throw error;

        setServices(services.filter(service => service.id !== serviceId));
        console.log('Service deleted successfully:', serviceId);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage your salon services and pricing
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">Add Service</Button>
      </div>

      {/* Service Grid */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No services added yet</p>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">Add Your First Service</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold leading-none tracking-tight">{service.name}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(service)}
                    className="h-8 w-8"
                  >
                    <Pencil size={16} className="text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(service.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">${service.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{service.duration_minutes} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddService={handleAddServiceSubmit}
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        onEditService={handleEditServiceSubmit}
      />
    </div>
  );
}
