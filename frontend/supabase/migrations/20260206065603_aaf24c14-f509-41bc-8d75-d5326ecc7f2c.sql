-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  href text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for user_id and read_at for efficient queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Only system/edge functions can insert notifications (via service role)
-- For now, allow users to insert for demo purposes
CREATE POLICY "Users can insert own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add onboarding_seen_at to profiles for tracking intro views
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_seen_at timestamp with time zone;