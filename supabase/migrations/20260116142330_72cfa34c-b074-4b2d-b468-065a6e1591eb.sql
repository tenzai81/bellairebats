-- Fix profiles table RLS policies
-- The issue: all policies are RESTRICTIVE (AND logic), so USING(false) blocks everyone
-- Solution: Make user access policies PERMISSIVE (OR logic), keep anonymous deny as RESTRICTIVE

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create PERMISSIVE policy for users to view their own profile
-- PERMISSIVE is the default, multiple PERMISSIVE policies are ORed together
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create PERMISSIVE policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Explicitly deny anonymous access (no policy for anon role = denied by default)
-- Since we're only granting to 'authenticated', anon users have no access