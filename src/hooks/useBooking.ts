import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarEvent, downloadICSFile, openGoogleCalendar } from '@/lib/calendar-utils';

export interface Coach {
  id: string;
  display_name: string;
  specialty: string[] | null;
  hourly_rate: number;
  avatar_url: string | null;
  location: string | null;
  experience_years: number | null;
  rating: number | null;
  review_count: number | null;
}

export interface BookingData {
  coachId: string;
  coachName: string;
  sessionDate: Date;
  startTime: string;
  duration: 30 | 60 | 90;
  sessionType: 'one_on_one' | 'group';
  price: number;
  notes?: string;
}

export const useBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const { toast } = useToast();

  const fetchCoaches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coaches. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBookingCheckout = async (bookingData: BookingData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to book a session.',
          variant: 'destructive',
        });
        return null;
      }

      // Calculate end time
      const [hours, minutes] = bookingData.startTime.split(':').map(Number);
      const endMinutes = minutes + bookingData.duration;
      const endHours = hours + Math.floor(endMinutes / 60);
      const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: {
          coachId: bookingData.coachId,
          coachName: bookingData.coachName,
          sessionDate: bookingData.sessionDate.toISOString().split('T')[0],
          startTime: bookingData.startTime,
          endTime: endTime,
          duration: bookingData.duration,
          sessionType: bookingData.sessionType,
          price: bookingData.price,
          notes: bookingData.notes,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        return data;
      }

      throw new Error('No checkout URL returned');
    } catch (error) {
      console.error('Error creating booking checkout:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (sessionId: string, bookingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-booking-payment', {
        body: { sessionId, bookingId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return null;
    }
  };

  const addToAppleCalendar = (bookingData: BookingData) => {
    const startDateTime = new Date(bookingData.sessionDate);
    const [hours, minutes] = bookingData.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + bookingData.duration);

    const event: CalendarEvent = {
      title: `Baseball Training with ${bookingData.coachName}`,
      description: `${bookingData.duration}-minute ${bookingData.sessionType === 'one_on_one' ? '1-on-1' : 'Group'} training session.\n\nNotes: ${bookingData.notes || 'None'}`,
      startTime: startDateTime,
      endTime: endDateTime,
      coachName: bookingData.coachName,
    };

    downloadICSFile(event);
    toast({
      title: 'Calendar Event Downloaded',
      description: 'Open the downloaded file to add to Apple Calendar.',
    });
  };

  const addToGoogleCalendar = (bookingData: BookingData) => {
    const startDateTime = new Date(bookingData.sessionDate);
    const [hours, minutes] = bookingData.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + bookingData.duration);

    const event: CalendarEvent = {
      title: `Baseball Training with ${bookingData.coachName}`,
      description: `${bookingData.duration}-minute ${bookingData.sessionType === 'one_on_one' ? '1-on-1' : 'Group'} training session.\n\nNotes: ${bookingData.notes || 'None'}`,
      startTime: startDateTime,
      endTime: endDateTime,
      coachName: bookingData.coachName,
    };

    openGoogleCalendar(event);
    toast({
      title: 'Google Calendar Opened',
      description: 'Complete adding the event in the new tab.',
    });
  };

  return {
    isLoading,
    coaches,
    fetchCoaches,
    createBookingCheckout,
    verifyPayment,
    addToAppleCalendar,
    addToGoogleCalendar,
  };
};
