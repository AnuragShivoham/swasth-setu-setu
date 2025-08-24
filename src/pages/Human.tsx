import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ConsultCard from "@/components/ConsultCard";
import DoctorCard from "@/components/DoctorCard";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  User, 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar,
  Shield,
  Clock,
  Users,
  Star,
  Download,
  Upload,
  FileText,
  CalendarCheck,
  CalendarX,
  Stethoscope
} from "lucide-react";

const Human = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("consultations");
  const [uploadingFile, setUploadingFile] = useState(false);

  const specialties = [
    { name: "General Medicine", doctors: 1200, available: 45 },
    { name: "Cardiology", doctors: 300, available: 12 },
    { name: "Dermatology", doctors: 250, available: 18 },
    { name: "Gynecology", doctors: 400, available: 22 },
    { name: "Pediatrics", doctors: 350, available: 28 },
    { name: "Psychiatry", doctors: 180, available: 8 }
  ];

  const availableDoctors = [
    {
      name: "Priya Sharma",
      specialty: "General Medicine",
      experience: "8+ years",
      rating: 4.8,
      languages: ["Hindi", "English"],
      location: "Delhi",
      availability: "Available now",
      isOnline: true
    },
    {
      name: "Rajesh Kumar",
      specialty: "Cardiology",
      experience: "12+ years",
      rating: 4.9,
      languages: ["Hindi", "English", "Punjabi"],
      location: "Mumbai", 
      availability: "Next: 15 min",
      isOnline: false
    },
    {
      name: "Meera Patel",
      specialty: "Dermatology",
      experience: "6+ years",
      rating: 4.7,
      languages: ["Hindi", "English", "Gujarati"],
      location: "Ahmedabad",
      availability: "Available now",
      isOnline: true
    }
  ];

  const handleDownloadMedicalHistory = async () => {
    try {
      // Get current user (in a real app, you'd get this from auth)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to download your medical history.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-medical-pdf', {
        body: { userId: user.id }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medical-history.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Medical history downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading medical history:', error);
      toast({
        title: "Error",
        description: "Failed to download medical history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload files.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: "Medical document uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Human Healthcare</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="reschedule" className="flex items-center gap-2">
              <CalendarX className="h-4 w-4" />
              Reschedule
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Doctors
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="inline-block feature-highlight text-sm font-medium">
                🩺 Trusted by 5M+ patients across India
              </div>
              <h2 className="text-4xl font-bold">
                Healthcare
                <span className="medical-heading block">Anytime, Anywhere</span>
              </h2>
              <p className="text-xl trust-text max-w-3xl mx-auto">
                Connect with verified doctors through video, audio, or messaging. 
                Available in 12+ Indian languages with flexible scheduling.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" onClick={() => alert('Starting video consultation...')}>
                  <Video className="h-5 w-5 mr-2" />
                  Start Video Consultation
                </Button>
                <Button variant="medical" size="lg" onClick={() => setActiveTab("schedule")}>
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            </div>

            {/* Quick Consultation Options */}
            <section>
              <h3 className="text-2xl font-bold text-center mb-8">
                Choose Your Consultation Type
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <ConsultCard
                  type="video"
                  title="Video Consultation"
                  description="Face-to-face consultation with HD video quality and screen sharing"
                  eta="2 min"
                  queuePosition={3}
                  totalQueue={12}
                  onConsult={() => alert("Starting video consultation...")}
                />
                <ConsultCard
                  type="audio"
                  title="Audio Consultation"
                  description="Voice-only consultation optimized for low bandwidth areas"
                  doctorName="Priya Sharma"
                  specialty="General Medicine"
                  onConsult={() => alert("Starting audio consultation...")}
                  onCancel={() => alert("Consultation cancelled")}
                  onReschedule={() => alert("Rescheduling consultation...")}
                />
                <ConsultCard
                  type="async"
                  title="Message Doctor"
                  description="Share symptoms and get expert medical advice through secure messaging"
                  eta="1 hour"
                  onConsult={() => alert("Starting message consultation...")}
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Schedule New Appointment</h2>
              <p className="text-xl trust-text max-w-2xl mx-auto">
                Book your consultation with our verified healthcare professionals
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Appointment Booking</CardTitle>
                <CardDescription>
                  Choose your preferred date, time, and consultation type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Consultation Type</label>
                    <select className="w-full p-3 border rounded-lg">
                      <option>Video Consultation</option>
                      <option>Audio Consultation</option>
                      <option>In-person Visit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Specialty</label>
                    <select className="w-full p-3 border rounded-lg">
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Dermatology</option>
                      <option>Pediatrics</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Date</label>
                    <Input type="date" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Time</label>
                    <select className="w-full p-3 border rounded-lg">
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 6 PM)</option>
                      <option>Evening (6 PM - 9 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg" 
                    rows={3} 
                    placeholder="Briefly describe your symptoms or reason for consultation..."
                  />
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    toast({
                      title: "Appointment Scheduled!",
                      description: "Your appointment has been scheduled. You'll receive a confirmation email shortly.",
                    });
                  }}
                >
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reschedule" className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Reschedule Appointments</h2>
              <p className="text-xl trust-text max-w-2xl mx-auto">
                Manage and reschedule your existing appointments
              </p>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
              <Card className="consultation-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Video Consultation - Dr. Priya Sharma</CardTitle>
                      <CardDescription>General Medicine • Tomorrow, 2:00 PM</CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Confirmed</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => alert('Rescheduling appointment...')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert('Cancelling appointment...')}>
                      <CalendarX className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button variant="hero" size="sm" onClick={() => alert('Joining consultation...')}>
                      <Video className="h-4 w-4 mr-2" />
                      Join Early
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="consultation-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Audio Consultation - Dr. Rajesh Kumar</CardTitle>
                      <CardDescription>Cardiology • Monday, 10:00 AM</CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">Scheduled</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => alert('Rescheduling appointment...')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert('Cancelling appointment...')}>
                      <CalendarX className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Our Medical Specialists</h2>
              <p className="text-xl trust-text max-w-2xl mx-auto">
                Connect with verified doctors across various specialties
              </p>
            </div>

            {/* Specialties Grid */}
            <section>
              <h3 className="text-2xl font-bold text-center mb-8">Medical Specialties</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                {specialties.map((specialty, index) => (
                  <Card key={index} className="consultation-card text-center cursor-pointer hover-scale">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-3">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">{specialty.name}</h4>
                      <p className="text-sm text-muted-foreground">{specialty.doctors} doctors</p>
                      <p className="text-xs text-success">{specialty.available} available now</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Available Doctors */}
            <section>
              <h3 className="text-2xl font-bold text-center mb-8">Available Doctors</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDoctors.map((doctor, index) => (
                  <DoctorCard key={index} {...doctor} />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Medical History</h2>
              <p className="text-xl trust-text max-w-2xl mx-auto">
                Access and manage your complete medical records
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="consultation-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Medical History
                  </CardTitle>
                  <CardDescription>
                    Get a comprehensive PDF report of all your medical records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleDownloadMedicalHistory}
                    className="w-full"
                    variant="hero"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="consultation-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Medical Documents
                  </CardTitle>
                  <CardDescription>
                    Upload previous medical records, test results, or prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </p>
                    {uploadingFile && (
                      <p className="text-sm text-primary">Uploading...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Medical Records */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>
                  Your recent consultations and medical history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">General Consultation</h4>
                      <span className="text-sm text-muted-foreground">March 15, 2024</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Dr. Priya Sharma - General Medicine</p>
                    <p className="text-sm"><strong>Diagnosis:</strong> Common cold with mild fever</p>
                    <p className="text-sm"><strong>Treatment:</strong> Rest, hydration, paracetamol as needed</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Annual Checkup</h4>
                      <span className="text-sm text-muted-foreground">February 28, 2024</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Dr. Rajesh Kumar - General Medicine</p>
                    <p className="text-sm"><strong>Status:</strong> All vitals normal, recommended annual blood work</p>
                    <p className="text-sm"><strong>Follow-up:</strong> Schedule blood tests within 2 weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Human;