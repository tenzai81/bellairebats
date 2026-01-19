import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Calendar, Clock, Loader2, Apple, Chrome, Home } from 'lucide-react';
import { useBooking, BookingData } from '@/hooks/useBooking';
import { formatTimeSlot } from '@/lib/calendar-utils';

interface BookingDetails {
  id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  session_type: string;
  price: number;
  coaches: {
    display_name: string;
    specialty: string[] | null;
  };
}

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, addToAppleCalendar, addToGoogleCalendar } = useBooking();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const verify = async () => {
      if (!sessionId || !bookingId) {
        setError('Missing payment information');
        setIsVerifying(false);
        return;
      }

      const result = await verifyPayment(sessionId, bookingId);
      
      if (result?.success && result?.paymentStatus === 'paid') {
        setBooking(result.booking);
      } else {
        setError('Payment verification failed. Please contact support.');
      }
      
      setIsVerifying(false);
    };

    verify();
  }, [sessionId, bookingId]);

  const getCalendarData = (): BookingData | null => {
    if (!booking) return null;
    
    return {
      coachId: '',
      coachName: booking.coaches.display_name,
      sessionDate: new Date(booking.session_date),
      startTime: booking.start_time,
      duration: booking.duration_minutes as 30 | 60 | 90,
      sessionType: booking.session_type as 'one_on_one' | 'group',
      price: Number(booking.price),
    };
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Payment Issue</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => navigate('/')} className="w-full">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground">
              Your session with {booking?.coaches.display_name} has been booked and paid.
            </p>
          </div>
        </div>

        {booking && (
          <Card className="p-4 bg-secondary">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Date
                </span>
                <span className="font-medium">
                  {new Date(booking.session_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Time
                </span>
                <span className="font-medium">
                  {formatTimeSlot(booking.start_time)} ({booking.duration_minutes} min)
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 mt-3">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold text-lg">${Number(booking.price).toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-center">Add to your calendar</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const data = getCalendarData();
                if (data) addToAppleCalendar(data);
              }}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Apple className="w-4 h-4" />
              Apple
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = getCalendarData();
                if (data) addToGoogleCalendar(data);
              }}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Chrome className="w-4 h-4" />
              Google
            </Button>
          </div>
        </div>

        <Button onClick={() => navigate('/')} className="w-full" size="lg">
          <Home className="w-4 h-4 mr-2" />
          Return Home
        </Button>
      </Card>
    </div>
  );
};

export default BookingSuccess;
