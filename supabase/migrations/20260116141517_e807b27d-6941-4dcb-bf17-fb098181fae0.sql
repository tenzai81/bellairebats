
-- Add explicit policy to deny anonymous users from accessing profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);
