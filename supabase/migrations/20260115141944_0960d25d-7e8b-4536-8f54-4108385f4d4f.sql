-- Create coaches table
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialty TEXT[],
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 75.00,
  avatar_url TEXT,
  location TEXT,
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.00,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coach availability table (weekly recurring slots)
CREATE TABLE public.coach_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  session_type TEXT NOT NULL CHECK (session_type IN ('one_on_one', 'group')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  google_event_id TEXT,
  apple_calendar_exported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Coaches policies
CREATE POLICY "Anyone can view active coaches" ON public.coaches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can update their own profile" ON public.coaches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coaches" ON public.coaches
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coach availability policies
CREATE POLICY "Anyone can view coach availability" ON public.coach_availability
  FOR SELECT USING (true);

CREATE POLICY "Coaches can manage their own availability" ON public.coach_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.coaches WHERE id = coach_id AND user_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view their bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coaches WHERE id = coach_id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can update their bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.coaches WHERE id = coach_id AND user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_coach_availability_coach ON public.coach_availability(coach_id);
CREATE INDEX idx_bookings_coach ON public.bookings(coach_id);
CREATE INDEX idx_bookings_athlete ON public.bookings(athlete_id);
CREATE INDEX idx_bookings_date ON public.bookings(session_date);

-- Trigger for updated_at
CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();