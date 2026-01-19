import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useBooking, Coach, BookingData } from '@/hooks/useBooking';
import { formatTimeSlot, generateTimeSlots } from '@/lib/calendar-utils';
import { useAuth } from '@/hooks/useAuth';
import { Calendar as CalendarIcon, Clock, DollarSign, Star, MapPin, Loader2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCoach?: Coach;
}

type Step = 'coach' | 'datetime' | 'details';

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes', priceMultiplier: 0.5 },
  { value: 60, label: '60 minutes', priceMultiplier: 1 },
  { value: 90, label: '90 minutes', priceMultiplier: 1.5 },
] as const;

const SESSION_TYPES = [
  { value: 'one_on_one', label: '1-on-1 Training' },
  { value: 'group', label: 'Group Session' },
] as const;

const BookingModal = ({ open, onOpenChange, preselectedCoach }: BookingModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading, coaches, fetchCoaches, createBookingCheckout, addToAppleCalendar, addToGoogleCalendar } = useBooking();
  
  const [step, setStep] = useState<Step>('coach');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(preselectedCoach || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [sessionType, setSessionType] = useState<'one_on_one' | 'group'>('one_on_one');
  const [notes, setNotes] = useState('');

  const timeSlots = generateTimeSlots(8, 20, 30);

  useEffect(() => {
    if (open && coaches.length === 0) {
      fetchCoaches();
    }
  }, [open]);

  useEffect(() => {
    if (preselectedCoach) {
      setSelectedCoach(preselectedCoach);
      setStep('datetime');
    }
  }, [preselectedCoach]);

  const resetModal = () => {
    setStep('coach');
    setSelectedCoach(preselectedCoach || null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setDuration(60);
    setSessionType('one_on_one');
    setNotes('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetModal, 300);
  };

  const calculatePrice = () => {
    if (!selectedCoach) return 0;
    const multiplier = DURATION_OPTIONS.find(d => d.value === duration)?.priceMultiplier || 1;
    return Number(selectedCoach.hourly_rate) * multiplier;
  };

  const handleBooking = async () => {
    if (!user) {
      handleClose();
      navigate('/auth');
      return;
    }

    if (!selectedCoach || !selectedDate || !selectedTime) return;

    const bookingData: BookingData = {
      coachId: selectedCoach.id,
      coachName: selectedCoach.display_name,
      sessionDate: selectedDate,
      startTime: selectedTime,
      duration,
      sessionType,
      price: calculatePrice(),
      notes,
    };

    // This will redirect to Stripe Checkout
    await createBookingCheckout(bookingData);
  };

  const renderCoachSelection = () => (
    <div className="space-y-4">
      <DialogDescription>Select a coach for your training session</DialogDescription>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : coaches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No coaches available at the moment.</p>
          <p className="text-sm mt-2">Please check back later.</p>
        </div>
      ) : (
        <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
          {coaches.map((coach) => (
            <Card
              key={coach.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedCoach?.id === coach.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCoach(coach)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={coach.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {coach.display_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{coach.display_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {coach.specialty?.join(', ') || 'General Training'}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    {coach.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        {Number(coach.rating).toFixed(1)}
                      </span>
                    )}
                    {coach.location && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {coach.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${Number(coach.hourly_rate)}</p>
                  <p className="text-xs text-muted-foreground">/hour</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Button
        className="w-full"
        onClick={() => setStep('datetime')}
        disabled={!selectedCoach}
      >
        Continue
      </Button>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-4">
      <DialogDescription>Choose your preferred date and time</DialogDescription>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-2 block">Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className="rounded-md border"
          />
        </div>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {formatTimeSlot(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v) as 30 | 60 | 90)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Session Type</Label>
            <Select value={sessionType} onValueChange={(v) => setSessionType(v as 'one_on_one' | 'group')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('coach')} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => setStep('details')}
          disabled={!selectedDate || !selectedTime}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDetailsReview = () => (
    <div className="space-y-4">
      <DialogDescription>Review and confirm your booking</DialogDescription>
      
      {selectedCoach && (
        <Card className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={selectedCoach.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {selectedCoach.display_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{selectedCoach.display_name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedCoach.specialty?.join(', ')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatTimeSlot(selectedTime)} ({duration} min)</span>
            </div>
          </div>
        </Card>
      )}

      <div>
        <Label className="mb-2 block">Notes (optional)</Label>
        <Textarea
          placeholder="Any specific areas you'd like to focus on?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Card className="p-4 bg-secondary">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold flex items-center gap-1">
            <DollarSign className="w-5 h-5" />
            {calculatePrice().toFixed(2)}
          </span>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">
          Back
        </Button>
        <Button onClick={handleBooking} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : user ? (
            'Proceed to Payment'
          ) : (
            'Sign In to Book'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'coach' && 'Book a Session'}
            {step === 'datetime' && 'Select Date & Time'}
            {step === 'details' && 'Review & Pay'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'coach' && renderCoachSelection()}
        {step === 'datetime' && renderDateTimeSelection()}
        {step === 'details' && renderDetailsReview()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
