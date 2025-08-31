-- Fix function search path security issue
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
STABLE
SET search_path = public
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