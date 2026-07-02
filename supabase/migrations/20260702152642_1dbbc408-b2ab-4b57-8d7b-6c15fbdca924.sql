DROP POLICY IF EXISTS "anyone can read a reflection session by id" ON public.reflection_sessions;

REVOKE SELECT ON public.reflection_sessions FROM anon, authenticated;
GRANT ALL ON public.reflection_sessions TO service_role;