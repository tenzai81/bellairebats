import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, DollarSign, Check, X } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import type { Booking } from '@/hooks/useCoachDashboard';

interface BookingsListProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, status: string) => Promise<boolean>;
  onCancelWithRefund: (bookingId: string) => Promise<boolean>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
  completed: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
  paid: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  refunded: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  failed: 'bg-red-500/20 text-red-600 border-red-500/30',
};

const BookingsList = ({ bookings, onUpdateStatus, onCancelWithRefund }: BookingsListProps) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const today = startOfDay(new Date());
  
  const upcomingBookings = bookings.filter(b => 
    isAfter(parseISO(b.session_date), today) || 
    format(parseISO(b.session_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );
  
  const pastBookings = bookings.filter(b => 
    isBefore(parseISO(b.session_date), today) && 
    format(parseISO(b.session_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')
  );

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const openCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    
    setIsCancelling(true);
    const isPaid = bookingToCancel.payment_status === 'paid';
    
    if (isPaid) {
      await onCancelWithRefund(bookingToCancel.id);
    } else {
      await onUpdateStatus(bookingToCancel.id, 'cancelled');
    }
    
    setIsCancelling(false);
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const renderBookingCard = (booking: Booking) => {
    const isPaid = booking.payment_status === 'paid';

    return (
      <div
        key={booking.id}
        className="p-4 rounded-lg bg-muted/50 border border-border space-y-3"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="w-4 h-4 text-accent" />
              {format(parseISO(booking.session_date), 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)} ({booking.duration_minutes} min)
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={`${statusColors[booking.status] || statusColors.pending} border capitalize`}>
              {booking.status}
            </Badge>
            {booking.payment_status && (
              <Badge className={`${paymentStatusColors[booking.payment_status] || paymentStatusColors.pending} border capitalize`}>
                {booking.payment_status}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              ${booking.price}
            </div>
            <Badge variant="outline" className="capitalize">
              {booking.session_type.replace('_', ' ')}
            </Badge>
          </div>
          
          {booking.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="text-green-600 border-green-600 hover:bg-green-500/10"
              >
                <Check className="w-4 h-4 mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openCancelDialog(booking)}
                className="text-red-600 border-red-600 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-1" />
                {isPaid ? 'Cancel & Refund' : 'Cancel'}
              </Button>
            </div>
          )}
          
          {booking.status === 'confirmed' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(booking.id, 'completed')}
                className="text-blue-600 border-blue-600 hover:bg-blue-500/10"
              >
                Mark Completed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openCancelDialog(booking)}
                className="text-red-600 border-red-600 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-1" />
                {isPaid ? 'Cancel & Refund' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>
        
        {booking.notes && (
          <p className="text-sm text-muted-foreground pt-2 border-t border-border">
            <span className="font-medium">Notes:</span> {booking.notes}
          </p>
        )}
      </div>
    );
  };

  const isPaidBooking = bookingToCancel?.payment_status === 'paid';

  return (
    <div className="space-y-6">
      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPaidBooking ? 'Cancel Booking & Issue Refund?' : 'Cancel Booking?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bookingToCancel && (
                <>
                  You are about to cancel the session on{' '}
                  <strong>{format(parseISO(bookingToCancel.session_date), 'MMMM d, yyyy')}</strong> at{' '}
                  <strong>{formatTime(bookingToCancel.start_time)}</strong>.
                  {isPaidBooking && (
                    <span className="block mt-2 text-orange-600">
                      A refund of <strong>${bookingToCancel.price}</strong> will be issued to the athlete.
                    </span>
                  )}
                  <span className="block mt-2">This action cannot be undone.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : isPaidBooking ? 'Cancel & Refund' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upcoming Bookings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>
            {upcomingBookings.length} session{upcomingBookings.length !== 1 ? 's' : ''} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No upcoming sessions scheduled
            </p>
          ) : (
            upcomingBookings.map(renderBookingCard)
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Past Sessions</CardTitle>
            <CardDescription>
              {pastBookings.length} completed session{pastBookings.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastBookings.slice(0, 5).map(renderBookingCard)}
            {pastBookings.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                + {pastBookings.length - 5} more past sessions
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingsList;
