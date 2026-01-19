import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RotateCcw } from 'lucide-react';

const BookingCanceled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-2">Payment Canceled</h2>
          <p className="text-muted-foreground">
            Your booking was not completed. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate('/')} className="w-full" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BookingCanceled;
