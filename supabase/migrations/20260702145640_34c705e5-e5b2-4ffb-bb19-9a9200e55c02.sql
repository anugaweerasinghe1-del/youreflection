
DROP POLICY "anyone can insert a reflection session" ON public.reflection_sessions;
DROP POLICY "anyone can submit a wall entry" ON public.wall_entries;
REVOKE INSERT ON public.reflection_sessions FROM anon, authenticated;
REVOKE INSERT ON public.wall_entries FROM anon, authenticated;
