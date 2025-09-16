import { useState, useEffect } from "react";
import "./tabFloatEffect.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConsultCard from "@/components/ConsultCard";
import DoctorCard from "@/components/DoctorCard";
import VideoCall from "@/components/VideoCall";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Star
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Human = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ name: string; specialty: string } | null>(null);
  const [showCallRequest, setShowCallRequest] = useState(false);
  const [callRequestDoctor, setCallRequestDoctor] = useState<any>(null);
  const [callType, setCallType] = useState<'video' | 'audio' | 'text'>('video');
  const [callMessage, setCallMessage] = useState("");
  const { token } = useAuth();


  const specialties = [
    { name: "General Medicine", doctors: 1200, available: 45 },
    { name: "Cardiology", doctors: 300, available: 12 },
    { name: "Dermatology", doctors: 250, available: 18 },
    { name: "Gynecology", doctors: 400, available: 22 },
    { name: "Pediatrics", doctors: 350, available: 28 },
    { name: "Psychiatry", doctors: 180, available: 8 }
  ];

  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

  // Fetch real registered doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // First try to get online doctors, fallback to available doctors
        let res = await fetch('http://localhost:5000/doctor/online');
        let data = await res.json();

        // If no online doctors found, try available doctors
        if (!data || data.length === 0) {
          console.log("No online doctors found, fetching available doctors...");
          res = await fetch('http://localhost:5000/doctor/available');
          data = await res.json();
        }

        if (res.ok && data && data.length > 0) {
          // Map doctors to expected format with default values for missing fields
          const doctors = data.map((doc: any) => ({
            name: doc.name,
            specialty: doc.specialization,
            experience: doc.experience_years ? `${doc.experience_years}+ years` : "Not specified",
            rating: 4.8, // Placeholder rating, can be fetched from backend if available
            languages: ["Hindi", "English"], // Placeholder languages
            location: "Unknown", // Placeholder location
            availability: doc.is_available ? "Available now" : "Unavailable",
            isOnline: doc.is_online === true, // Ensure boolean true for online status
            doctorId: doc.id
          }));
          setAvailableDoctors(doctors);
          console.log(`Loaded ${doctors.length} doctors`);
        } else {
          console.log("No doctors data received");
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Additional state for call requests
  const [callRequests, setCallRequests] = useState<any[]>([]);

  // Function to handle call request
  const handleCallRequest = async (doctor: any, type: 'video' | 'audio' | 'text') => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to send call requests",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending call request", { doctorId: doctor.doctorId, callType: type, message: callMessage, token });
      const response = await fetch('http://localhost:5000/notification/call-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: doctor.doctorId,
          call_type: type,
          message: callMessage,
        }),
      });

      const data = await response.json();
      console.log("Call request response", data);

      if (response.ok) {
        toast({
          title: "Call Request Sent",
          description: `Your ${type} call request has been sent to Dr. ${doctor.name}`,
        });
        setShowCallRequest(false);
        setCallRequestDoctor(null);
        setCallMessage("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send call request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Call request error", error);
      toast({
        title: "Error",
        description: "Failed to send call request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to open call request dialog
  const openCallRequestDialog = (doctor: any, type: 'video' | 'audio' | 'text') => {
    setCallRequestDoctor(doctor);
    setCallType(type);
    setShowCallRequest(true);
  };

  return (
  <div className="min-h-screen bg-background tab-float-effect">
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
            <Button variant="hero" size="lg" onClick={() => {
              setSelectedDoctor({ name: "Priya Sharma", specialty: "General Medicine" });
              setShowVideoCall(true);
            }}>
              <Video className="h-5 w-5 mr-2" />
              Start Video Consultation
            </Button>
            <Button variant="medical" size="lg" onClick={() => setShowSchedule(true)}>
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
              onConsult={() => {
                setSelectedDoctor({ name: "Priya Sharma", specialty: "General Medicine" });
                setShowVideoCall(true);
              }}
            />
            <ConsultCard
              type="audio"
              title="Audio Consultation"
              description="Voice-only consultation optimized for low bandwidth areas"
              doctorName="Priya Sharma"
              specialty="General Medicine"
              onConsult={() => {
                setSelectedDoctor({ name: "Priya Sharma", specialty: "General Medicine" });
                setShowVideoCall(true);
              }}
              onCancel={() => console.log("Cancelling consultation")}
              onReschedule={() => console.log("Rescheduling consultation")}
            />
            <ConsultCard
              type="async"
              title="Message Doctor"
              description="Share symptoms and get expert medical advice through secure messaging"
              eta="1 hour"
              onConsult={() => navigate('/?tab=chatbot&context=human')}
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
              <DoctorCard key={doctor.doctorId || index} {...doctor} doctorId={doctor.doctorId} />
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
            <h3 className="text-2xl font-bold mb-4">Why Choose PAWMANITY for Human Healthcare?</h3>
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
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => window.open('tel:108', '_self')}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call 108 (Emergency)
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-white hover:bg-white hover:text-destructive" 
              onClick={() => window.open('tel:102', '_self')}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call 102 (Medical)
            </Button>
          </div>
        </section>

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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSpecialty ? `${selectedSpecialty} Specialists` : 'All Doctors'}</DialogTitle>
              <DialogDescription>Choose a doctor and consultation type.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {availableDoctors
                .filter(d => !selectedSpecialty || d.specialty === selectedSpecialty)
                .map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${doc.isOnline ? 'bg-success' : 'bg-muted'}`} />
                      <div>
                        <div className="font-medium">Dr. {doc.name}</div>
                        <div className="text-sm text-muted-foreground">{doc.specialty} • {doc.experience}</div>
                        <div className="text-xs text-muted-foreground">{doc.availability}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCallRequestDialog(doc, 'video')}
                        className="flex items-center gap-1"
                      >
                        <Video className="h-4 w-4" />
                        Video
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCallRequestDialog(doc, 'audio')}
                        className="flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        Audio
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCallRequestDialog(doc, 'text')}
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Text
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Call Modal */}
        {showVideoCall && selectedDoctor && (
          <VideoCall
            consultationType="human"
            doctorName={selectedDoctor.name}
            specialty={selectedDoctor.specialty}
            onEndCall={() => {
              setShowVideoCall(false);
              setSelectedDoctor(null);
            }}
          />
        )}

        {/* Call Request Dialog */}
        <Dialog open={showCallRequest} onOpenChange={setShowCallRequest}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Call Request</DialogTitle>
              <DialogDescription>
                Send a {callType} call request to Dr. {callRequestDoctor?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="call-type" className="text-right">Call Type</Label>
                <div className="col-span-3">
                  <div className="flex gap-2">
                    <Button
                      variant={callType === 'video' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCallType('video')}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                    <Button
                      variant={callType === 'audio' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCallType('audio')}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Audio
                    </Button>
                    <Button
                      variant={callType === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCallType('text')}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  className="col-span-3"
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCallRequest(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (callRequestDoctor) {
                    handleCallRequest(callRequestDoctor, callType);
                  }
                }}
              >
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Human;