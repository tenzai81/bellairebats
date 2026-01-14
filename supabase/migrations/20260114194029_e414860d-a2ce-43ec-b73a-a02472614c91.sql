-- Fix privilege escalation vulnerability by ignoring client-supplied role
-- Always assign 'athlete' role to new users - admin must elevate roles manually

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- SECURITY FIX: Always assign 'athlete' role regardless of client metadata
  -- Role elevation must be done by an admin through the proper admin-only RLS policies
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'athlete'::app_role);
  
  RETURN NEW;
END;
$function$;