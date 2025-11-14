-- Create consultation requests table
CREATE TABLE public.consultation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('video', 'audio', 'text')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  message TEXT,
  medical_profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.consultation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_request_id UUID NOT NULL REFERENCES public.consultation_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on consultation_requests
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- Patients can view their own requests
CREATE POLICY "Patients can view their own requests"
ON public.consultation_requests
FOR SELECT
TO authenticated
USING (patient_id = auth.uid());

-- Patients can create requests
CREATE POLICY "Patients can create requests"
ON public.consultation_requests
FOR INSERT
TO authenticated
WITH CHECK (patient_id = auth.uid());

-- Patients can update their own requests
CREATE POLICY "Patients can update their own requests"
ON public.consultation_requests
FOR UPDATE
TO authenticated
USING (patient_id = auth.uid());

-- Doctors can view requests assigned to them or pending requests
CREATE POLICY "Doctors can view relevant requests"
ON public.consultation_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'doctor'::app_role) AND 
  (doctor_id = auth.uid() OR doctor_id IS NULL)
);

-- Doctors can update requests assigned to them
CREATE POLICY "Doctors can update their requests"
ON public.consultation_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'doctor'::app_role) AND 
  doctor_id = auth.uid()
);

-- Enable RLS on consultation_messages
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON public.consultation_messages
FOR SELECT
TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.consultation_messages
FOR INSERT
TO authenticated
WITH CHECK (from_user_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_requests_updated_at
BEFORE UPDATE ON public.consultation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();