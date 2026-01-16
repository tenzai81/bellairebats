import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCoachDashboard } from '@/hooks/useCoachDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, LayoutDashboard, RefreshCw } from 'lucide-react';
import CoachProfileCard from '@/components/coach/CoachProfileCard';
import AvailabilityManager from '@/components/coach/AvailabilityManager';
import BookingsList from '@/components/coach/BookingsList';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const {
    coachProfile,
    availability,
    bookings,
    isLoading,
    updateAvailability,
    updateBookingStatus,
    refreshData,
  } = useCoachDashboard(user?.id);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'coach')) {
      navigate('/');
    }
  }, [user, role, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!coachProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display text-foreground">No Coach Profile Found</h1>
          <p className="text-muted-foreground">
            Your account doesn't have a coach profile yet. Please contact an administrator.
          </p>
        </div>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-accent" />
              <span className="font-display text-2xl text-foreground">COACH DASHBOARD</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-1">
            <CoachProfileCard profile={coachProfile} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="w-full bg-muted">
                <TabsTrigger value="bookings" className="flex-1">
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="availability" className="flex-1">
                  Availability
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookings" className="mt-6">
                <BookingsList 
                  bookings={bookings} 
                  onUpdateStatus={updateBookingStatus} 
                />
              </TabsContent>
              
              <TabsContent value="availability" className="mt-6">
                <AvailabilityManager 
                  availability={availability} 
                  onUpdateAvailability={updateAvailability} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
