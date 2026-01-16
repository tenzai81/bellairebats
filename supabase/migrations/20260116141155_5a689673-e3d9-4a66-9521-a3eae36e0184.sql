
-- Drop the foreign key constraint on coaches.user_id to allow demo data
ALTER TABLE public.coaches DROP CONSTRAINT IF EXISTS coaches_user_id_fkey;

-- Make user_id nullable for demo coaches
ALTER TABLE public.coaches ALTER COLUMN user_id DROP NOT NULL;
