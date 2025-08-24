import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's medical history
    const { data: medicalHistory, error } = await supabase
      .rpc('get_user_medical_history', { user_id_param: userId });

    if (error) {
      console.error('Error fetching medical history:', error);
      throw new Error('Failed to fetch medical history');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, date_of_birth, phone_number')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Generate HTML content for PDF
    const htmlContent = generateMedicalReportHTML(profile, medicalHistory);

    // Use OpenAI to convert HTML to PDF (using GPT-4 for text processing)
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // For now, we'll return the HTML content as a downloadable file
    // In a production environment, you'd use a PDF generation library
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Medical History Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .patient-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .record { border: 1px solid #ddd; margin-bottom: 20px; padding: 20px; border-radius: 8px; }
          .record-header { background: #e8f4fd; padding: 10px; margin: -20px -20px 15px -20px; border-radius: 8px 8px 0 0; }
          h1, h2, h3 { color: #333; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    return new Response(pdfContent, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="medical-history.html"'
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMedicalReportHTML(profile: any, medicalHistory: any[]): string {
  const patientName = `${profile.first_name} ${profile.last_name}`;
  const currentDate = new Date().toLocaleDateString();

  return `
    <div class="header">
      <h1>MEDICAL HISTORY REPORT</h1>
      <p>Generated on ${currentDate}</p>
    </div>

    <div class="patient-info">
      <h2>Patient Information</h2>
      <div class="field"><span class="label">Name:</span> ${patientName}</div>
      <div class="field"><span class="label">Date of Birth:</span> ${profile.date_of_birth || 'Not provided'}</div>
      <div class="field"><span class="label">Phone:</span> ${profile.phone_number || 'Not provided'}</div>
      <div class="field"><span class="label">Report Generated:</span> ${currentDate}</div>
    </div>

    <h2>Medical Records</h2>
    ${medicalHistory && medicalHistory.length > 0 
      ? medicalHistory.map(record => `
          <div class="record">
            <div class="record-header">
              <h3>Consultation - ${new Date(record.record_date).toLocaleDateString()}</h3>
              <p><strong>Doctor:</strong> ${record.doctor_name || 'Not specified'} 
                 ${record.specialization ? `(${record.specialization})` : ''}</p>
            </div>
            ${record.symptoms ? `<div class="field"><span class="label">Symptoms:</span> ${record.symptoms}</div>` : ''}
            ${record.diagnosis ? `<div class="field"><span class="label">Diagnosis:</span> ${record.diagnosis}</div>` : ''}
            ${record.treatment_plan ? `<div class="field"><span class="label">Treatment Plan:</span> ${record.treatment_plan}</div>` : ''}
            ${record.prescription_notes ? `<div class="field"><span class="label">Prescription Notes:</span> ${record.prescription_notes}</div>` : ''}
          </div>
        `).join('')
      : '<p>No medical records found.</p>'
    }

    <div style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666;">
      <p>This report was generated by Medi & Tail Healthcare Platform</p>
      <p><em>For medical emergencies, please contact your healthcare provider immediately.</em></p>
    </div>
  `;
}