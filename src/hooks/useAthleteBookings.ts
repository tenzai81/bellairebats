import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AthleteBooking {
  id: string;
  coach_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  payment_status: string | null;
  price: number;
  notes: string | null;
  stripe_session_id: string | null;
  created_at: string;
  coaches: {
    display_name: string;
    avatar_url: string | null;
    specialty: string[] | null;
  } | null;
}

export const useAthleteBookings = () => {
  const [bookings, setBookings] = useState<AthleteBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          coaches:coach_id (
            display_name,
            avatar_url,
            specialty
          )
        `)
        .eq('athlete_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your bookings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in to cancel a booking.',
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: { bookingId },
      });

      if (error) throw error;

      toast({
        title: 'Booking Cancelled',
        description: data.message || 'Your booking has been cancelled.',
      });

      // Refresh bookings
      await fetchBookings();
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Cancellation Failed',
        description: error instanceof Error ? error.message : 'Failed to cancel booking.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast, fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    fetchBookings,
    cancelBooking,
  };
};
