-- Enable RLS on existing tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (patient_id = auth.uid());

CREATE POLICY "Users can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (patient_id = auth.uid());

-- Create RLS policies for medical records
CREATE POLICY "Users can view their own medical records" 
ON public.medical_records 
FOR SELECT 
USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient medical records" 
ON public.medical_records 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update medical records" 
ON public.medical_records 
FOR UPDATE 
USING (doctor_id = auth.uid());

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for doctors (public read for directory)
CREATE POLICY "Anyone can view doctor profiles" 
ON public.doctors 
FOR SELECT 
USING (true);

-- Create RLS policies for prescriptions
CREATE POLICY "Users can view their own prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.medical_records 
  WHERE medical_records.id = prescriptions.medical_record_id 
  AND medical_records.patient_id = auth.uid()
));

-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-documents', 'medical-documents', false);

-- Create storage policies for medical documents
CREATE POLICY "Users can upload their own medical documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own medical documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own medical documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to get user's medical history
CREATE OR REPLACE FUNCTION public.get_user_medical_history(user_id_param uuid)
RETURNS TABLE (
  record_id uuid,
  record_date timestamp with time zone,
  doctor_name text,
  specialization text,
  diagnosis text,
  symptoms text,
  treatment_plan text,
  prescription_notes text,
  medical_images text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    mr.id as record_id,
    mr.record_date,
    CONCAT(dp.first_name, ' ', dp.last_name) as doctor_name,
    d.specialization,
    mr.diagnosis,
    mr.symptoms,
    mr.treatment_plan,
    mr.prescription_notes,
    mr.medical_images
  FROM public.medical_records mr
  LEFT JOIN public.doctors d ON mr.doctor_id = d.profile_id
  LEFT JOIN public.profiles dp ON d.profile_id = dp.id
  WHERE mr.patient_id = user_id_param
  ORDER BY mr.record_date DESC;
$$;