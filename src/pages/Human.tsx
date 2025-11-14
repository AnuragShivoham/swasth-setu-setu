import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConsultCard from "@/components/ConsultCard";
import DoctorCard from "@/components/DoctorCard";
import VideoCall from "@/components/VideoCall";
import AudioCall from "@/components/AudioCall";
import ChatComponent from "@/components/ChatComponent";
import CallRequestDialog from "@/components/CallRequestDialog";
import PatientRequestDialog from "@/components/PatientRequestDialog";
import { useNavigate } from "react-router-dom";
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
  UserPlus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Human = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [showPatientRequest, setShowPatientRequest] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [requestType, setRequestType] = useState<"video" | "audio" | "chat">("chat");
  const [onlineDoctors, setOnlineDoctors] = useState<any[]>([]);

  useEffect(() => {
    loadOnlineDoctors();
  }, []);

  const loadOnlineDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("is_online", true);

      if (error) throw error;
      setOnlineDoctors(data || []);
    } catch (error) {
      console.error("Error loading online doctors:", error);
    }
  };

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
      isOnline: true,
      id: "doc-1"
    },
    {
      name: "Rajesh Kumar",
      specialty: "Cardiology",
      experience: "12+ years",
      rating: 4.9,
      languages: ["Hindi", "English", "Punjabi"],
      location: "Mumbai",
      availability: "Next: 15 min",
      isOnline: false,
      id: "doc-2"
    },
    {
      name: "Meera Patel",
      specialty: "Dermatology",
      experience: "6+ years",
      rating: 4.7,
      languages: ["Hindi", "English", "Gujarati"],
      location: "Ahmedabad",
      availability: "Available now",
      isOnline: true,
      id: "doc-3"
    }
  ];

  const handleCommunicationRequest = (doctor: any, type: "video" | "audio" | "chat") => {
    setSelectedDoctor(doctor);
    setRequestType(type);
    setShowCallRequest(true);
  };

  const handlePatientRequest = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowPatientRequest(true);
  };

  const handleCallRequestSent = (reason: string) => {
    // Store the request in localStorage for demo purposes
    const requests = JSON.parse(localStorage.getItem("communication_requests") || "[]");
    requests.push({
      id: Date.now().toString(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      type: requestType,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
      patientName: "Current User" // In real app, get from auth
    });
    localStorage.setItem("communication_requests", JSON.stringify(requests));

    // In a real app, this would trigger a notification to the doctor
    console.log(`Communication request sent to Dr. ${selectedDoctor.name} for ${requestType} call`);
  };

  const handlePatientRequestSent = (requestData: any) => {
    // Store the patient request in localStorage for demo purposes
    const requests = JSON.parse(localStorage.getItem("patient_requests") || "[]");
    requests.push({
      id: Date.now().toString(),
      ...requestData,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("patient_requests", JSON.stringify(requests));

    // In a real app, this would trigger a notification to the doctor
    console.log(`Patient request sent to Dr. ${selectedDoctor.name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Human Healthcare</h1>
                <p className="text-sm text-muted-foreground">Complete medical care for people</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-block feature-highlight text-sm font-medium">
            🩺 Trusted by 10L+ patients across India
          </div>
          <h2 className="text-4xl font-bold">
            Get Expert Medical Care
            <span className="medical-heading block">Anytime, Anywhere</span>
          </h2>
          <p className="text-xl trust-text max-w-3xl mx-auto">
            Connect with verified doctors through video, audio, or messaging.
            Available in 12+ Indian languages with flexible scheduling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => setShowSpecialists(true)}>
              <Video className="h-5 w-5 mr-2" />
              Start Video Consultation
            </Button>
            <Button variant="medical" size="lg" onClick={() => setShowSchedule(true)}>
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        {/* Online Doctors Section */}
        {onlineDoctors.length > 0 && (
          <section className="py-8 bg-success/5 border border-success/20 rounded-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🟢 Doctors Online Now</h3>
              <p className="text-muted-foreground">Connect instantly with available doctors</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onlineDoctors.slice(0, 6).map((doctor, index) => (
                <Card key={index} className="consultation-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Dr. {doctor.name}</h4>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCommunicationRequest(doctor, "video")}
                        className="flex-1"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCommunicationRequest(doctor, "audio")}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Audio
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCommunicationRequest(doctor, "chat")}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handlePatientRequest(doctor)}
                      className="w-full mt-2"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Request as Patient
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

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
              context="human"
            />
            <ConsultCard
              type="audio"
              title="Audio Consultation"
              description="Voice-only consultation optimized for low bandwidth areas"
              doctorName="Priya Sharma"
              specialty="General Medicine"
              context="human"
              onCancel={() => console.log("Cancelling consultation")}
              onReschedule={() => console.log("Rescheduling consultation")}
            />
            <ConsultCard
              type="async"
              title="Message Doctor"
              description="Share symptoms and get expert medical advice through secure messaging"
              eta="1 hour"
              context="human"
              onConsult={() => navigate('/home?tab=chatbot&context=human')}
            />
          </div>
        </section>

        {/* Medical Specialties */}
        <section className="py-12 bg-muted/30 -mx-4 px-4 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Medical Specialties</h3>
            <p className="trust-text">Expert care across all medical disciplines</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((specialty, index) => (
              <Card key={index} className="consultation-card hover-scale cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{specialty.name}</h4>
                    <div className="flex items-center gap-1 text-success text-sm">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      {specialty.available} online
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {specialty.doctors} doctors available
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => { setSelectedSpecialty(specialty.name); setShowSpecialists(true); }}>
                    View Specialists
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Available Doctors */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Top Available Doctors</h3>
            <p className="trust-text">Connect with highly-rated medical professionals</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {availableDoctors.map((doctor, index) => (
              <DoctorCard key={index} {...doctor} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="consult" size="lg" onClick={() => setShowSpecialists(true)}>
              <Users className="h-5 w-5 mr-2" />
              View All 5000+ Doctors
            </Button>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Why Choose <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">PAWMANITY</span> for Human Healthcare?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="consultation-card">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Verified Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="trust-text">
                  All doctors are verified by medical councils with valid licenses and certifications.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="consultation-card">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-secondary/10 w-fit">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">24/7 Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="trust-text">
                  Round-the-clock medical support with emergency consultation services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="consultation-card">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-accent/10 w-fit">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Multilingual Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="trust-text">
                  Consultations available in Hindi, English, and 10+ regional Indian languages.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="emergency-gradient text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Medical Emergency?</h3>
          <p className="text-lg opacity-90 mb-6">
            For life-threatening situations, call emergency services immediately
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" onClick={() => (window.location.href = 'tel:108')}>
              <Phone className="h-5 w-5 mr-2" />
              Call 108 (Emergency)
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-destructive" onClick={() => (window.location.href = 'tel:102')}>
              <Phone className="h-5 w-5 mr-2" />
              Call 102 (Medical)
            </Button>
          </div>
        </section>

        {/* Call Request Dialog */}
        <CallRequestDialog
          isOpen={showCallRequest}
          onClose={() => setShowCallRequest(false)}
          doctorName={selectedDoctor?.name || ""}
          doctorSpecialty={selectedDoctor?.specialty || ""}
          requestType={requestType}
          onRequestSent={handleCallRequestSent}
        />

        {/* Patient Request Dialog */}
        <PatientRequestDialog
          isOpen={showPatientRequest}
          onClose={() => setShowPatientRequest(false)}
          doctorName={selectedDoctor?.name || ""}
          doctorSpecialty={selectedDoctor?.specialty || ""}
          onRequestSent={handlePatientRequestSent}
        />

        {/* Video Call Dialog */}
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          doctorName={selectedDoctor?.name || selectedDoctor?.profiles?.full_name || "Doctor"}
          patientName="You"
        />

        {/* Audio Call Dialog */}
        <AudioCall
          isOpen={showAudioCall}
          onClose={() => setShowAudioCall(false)}
          doctorName={selectedDoctor?.name || "Doctor"}
          patientName="You"
        />

        {/* Chat Dialog */}
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Chat with Dr. {selectedDoctor?.name}</DialogTitle>
              <DialogDescription>
                Secure messaging with your healthcare provider
              </DialogDescription>
            </DialogHeader>
            {selectedDoctor && (
              <ChatComponent
                roomId={`doctor-${selectedDoctor.id}-patient-${Date.now()}`}
                currentUserId="patient-current"
                currentUserName="You"
                currentUserRole="patient"
                otherUserName={selectedDoctor.name}
                otherUserRole="doctor"
                onClose={() => setShowChat(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
              <DialogDescription>Select a convenient date and time.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" className="col-span-3" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <Input id="time" type="time" className="col-span-3" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!scheduleDate || !scheduleTime) return;
                  const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
                  appts.push({ kind: 'human', date: scheduleDate, time: scheduleTime, createdAt: new Date().toISOString() });
                  localStorage.setItem('appointments', JSON.stringify(appts));
                  toast({ title: 'Appointment scheduled', description: `${scheduleDate} at ${scheduleTime}` });
                  setShowSchedule(false);
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Specialists Dialog */}
        <Dialog open={showSpecialists} onOpenChange={setShowSpecialists}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedSpecialty ? `${selectedSpecialty} Specialists` : 'Select a Doctor'}</DialogTitle>
              <DialogDescription>Choose a doctor for your consultation.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {(onlineDoctors.length > 0 ? onlineDoctors : availableDoctors)
                .filter(d => !selectedSpecialty || d.specialty === selectedSpecialty)
                .map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Dr. {doc.name || doc.profiles?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{doc.specialty} • {doc.availability || 'Available'}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setRequestType("video");
                          setShowCallRequest(true);
                        }}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setRequestType("audio");
                          setShowCallRequest(true);
                        }}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Audio
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate('/home?tab=chatbot&context=human')}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Human;
