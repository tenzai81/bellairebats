-- Add payment_status and stripe_session_id to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Create index for quick lookups by stripe session
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON public.bookings(stripe_session_id);

-- Update RLS policy to allow updating payment_status
-- Drop existing update policy if exists and recreate
DROP POLICY IF EXISTS "Athletes can update their own bookings" ON public.bookings;

CREATE POLICY "Athletes can update their own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = athlete_id)
WITH CHECK (auth.uid() = athlete_id);