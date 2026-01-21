import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAthleteBookings, AthleteBooking } from '@/hooks/useAthleteBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, DollarSign, User, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { bookings, isLoading, fetchBookings, cancelBooking } = useAthleteBookings();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string, paymentStatus: string | null) => {
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (paymentStatus === 'refunded') {
      return <Badge variant="outline">Refunded</Badge>;
    }
    if (paymentStatus === 'paid') {
      return <Badge className="bg-green-600 hover:bg-green-700">Confirmed</Badge>;
    }
    if (paymentStatus === 'pending') {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending Payment</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const canCancel = (booking: AthleteBooking): boolean => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }
    const sessionDate = parseISO(booking.session_date);
    return !isPast(sessionDate) || isToday(sessionDate);
  };

  const upcomingBookings = bookings.filter(b => {
    const sessionDate = parseISO(b.session_date);
    return (!isPast(sessionDate) || isToday(sessionDate)) && b.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(b => {
    const sessionDate = parseISO(b.session_date);
    return (isPast(sessionDate) && !isToday(sessionDate)) || b.status === 'cancelled';
  });

  const renderBookingCard = (booking: AthleteBooking) => (
    <Card key={booking.id} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Coach Info */}
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={booking.coaches?.avatar_url || ''} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{booking.coaches?.display_name || 'Coach'}</h3>
              {booking.coaches?.specialty && (
                <p className="text-sm text-muted-foreground">
                  {booking.coaches.specialty.slice(0, 2).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(parseISO(booking.session_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(booking.start_time)} ({booking.duration_minutes} min)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${booking.price}</span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {getStatusBadge(booking.status, booking.payment_status)}
            
            {canCancel(booking) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {booking.payment_status === 'paid' 
                        ? `This will cancel your session with ${booking.coaches?.display_name} and process a full refund of $${booking.price}.`
                        : `This will cancel your session with ${booking.coaches?.display_name}.`
                      }
                      <br /><br />
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelBooking(booking.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {booking.payment_status === 'paid' ? 'Cancel & Refund' : 'Cancel Booking'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {booking.notes && (
          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
            <span className="font-medium">Notes:</span> {booking.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">My Bookings</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Upcoming Sessions */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming sessions scheduled.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/">Book a Session</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(renderBookingCard)}
            </div>
          )}
        </section>

        {/* Past Sessions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Past Sessions</h2>
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No past sessions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.slice(0, 10).map(renderBookingCard)}
              {pastBookings.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing 10 of {pastBookings.length} past sessions
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyBookings;
