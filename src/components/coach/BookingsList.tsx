import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, Check, X } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import type { Booking } from '@/hooks/useCoachDashboard';

interface BookingsListProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, status: string) => Promise<boolean>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
  completed: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
};

const BookingsList = ({ bookings, onUpdateStatus }: BookingsListProps) => {
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

  const renderBookingCard = (booking: Booking) => (
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
        <Badge className={`${statusColors[booking.status] || statusColors.pending} border capitalize`}>
          {booking.status}
        </Badge>
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
              onClick={() => onUpdateStatus(booking.id, 'cancelled')}
              className="text-red-600 border-red-600 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}
        
        {booking.status === 'confirmed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus(booking.id, 'completed')}
            className="text-blue-600 border-blue-600 hover:bg-blue-500/10"
          >
            Mark Completed
          </Button>
        )}
      </div>
      
      {booking.notes && (
        <p className="text-sm text-muted-foreground pt-2 border-t border-border">
          <span className="font-medium">Notes:</span> {booking.notes}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
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
