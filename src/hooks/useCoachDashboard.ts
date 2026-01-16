import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachProfile {
  id: string;
  display_name: string;
  bio: string | null;
  specialty: string[] | null;
  hourly_rate: number;
  experience_years: number | null;
  rating: number | null;
  review_count: number | null;
  location: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
}

export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean | null;
}

export interface Booking {
  id: string;
  athlete_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  price: number;
  notes: string | null;
  created_at: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const useCoachDashboard = (userId: string | undefined) => {
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCoachProfile = async () => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching coach profile:', error);
      return null;
    }

    return data as CoachProfile;
  };

  const fetchAvailability = async (coachId: string) => {
    const { data, error } = await supabase
      .from('coach_availability')
      .select('*')
      .eq('coach_id', coachId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching availability:', error);
      return [];
    }

    return data as Availability[];
  };

  const fetchBookings = async (coachId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('coach_id', coachId)
      .order('session_date', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data as Booking[];
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    const profile = await fetchCoachProfile();
    if (profile) {
      setCoachProfile(profile);
      
      const [availabilityData, bookingsData] = await Promise.all([
        fetchAvailability(profile.id),
        fetchBookings(profile.id),
      ]);
      
      setAvailability(availabilityData);
      setBookings(bookingsData);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  const updateAvailability = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isAvailable: boolean
  ) => {
    if (!coachProfile) return false;

    // Check if availability exists for this day
    const existing = availability.find(a => a.day_of_week === dayOfWeek);

    if (existing) {
      const { error } = await supabase
        .from('coach_availability')
        .update({ start_time: startTime, end_time: endTime, is_available: isAvailable })
        .eq('id', existing.id);

      if (error) {
        toast({
          title: 'Error updating availability',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('coach_availability')
        .insert({
          coach_id: coachProfile.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
        });

      if (error) {
        toast({
          title: 'Error saving availability',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
    }

    toast({
      title: 'Availability updated',
      description: `${DAYS_OF_WEEK[dayOfWeek]} availability saved.`,
    });

    // Reload availability
    const updatedAvailability = await fetchAvailability(coachProfile.id);
    setAvailability(updatedAvailability);
    return true;
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: 'Error updating booking',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Booking updated',
      description: `Booking status changed to ${status}.`,
    });

    // Update local state
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status } : b
    ));
    return true;
  };

  const updateProfile = async (updates: Partial<CoachProfile>) => {
    if (!coachProfile) return false;

    const { error } = await supabase
      .from('coaches')
      .update(updates)
      .eq('id', coachProfile.id);

    if (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Profile updated',
      description: 'Your coach profile has been saved.',
    });

    setCoachProfile({ ...coachProfile, ...updates });
    return true;
  };

  return {
    coachProfile,
    availability,
    bookings,
    isLoading,
    updateAvailability,
    updateBookingStatus,
    updateProfile,
    refreshData: loadDashboardData,
    DAYS_OF_WEEK,
  };
};
