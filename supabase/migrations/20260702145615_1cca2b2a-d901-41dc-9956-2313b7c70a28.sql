
CREATE TABLE public.reflection_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  answers JSONB NOT NULL,
  letter JSONB NOT NULL,
  insights JSONB NOT NULL
);
GRANT SELECT, INSERT ON public.reflection_sessions TO anon, authenticated;
GRANT ALL ON public.reflection_sessions TO service_role;
ALTER TABLE public.reflection_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert a reflection session" ON public.reflection_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read a reflection session by id" ON public.reflection_sessions FOR SELECT TO anon, authenticated USING (true);

CREATE TYPE public.wall_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.wall_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT NOT NULL,
  status public.wall_status NOT NULL DEFAULT 'pending',
  moderation_reason TEXT
);
GRANT SELECT, INSERT ON public.wall_entries TO anon, authenticated;
GRANT ALL ON public.wall_entries TO service_role;
ALTER TABLE public.wall_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit a wall entry" ON public.wall_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read approved wall entries" ON public.wall_entries FOR SELECT TO anon, authenticated USING (status = 'approved');

CREATE INDEX wall_entries_approved_idx ON public.wall_entries (created_at DESC) WHERE status = 'approved';
