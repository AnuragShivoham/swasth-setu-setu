import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConsultCard from "@/components/ConsultCard";
import DoctorCard from "@/components/DoctorCard";
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
  Star
} from "lucide-react";

const Human = () => {
  const navigate = useNavigate();

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
            <Button variant="hero" size="lg">
              <Video className="h-5 w-5 mr-2" />
              Start Video Consultation
            </Button>
            <Button variant="medical" size="lg">
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
              onConsult={() => console.log("Starting video consultation")}
            />
            <ConsultCard
              type="audio"
              title="Audio Consultation"
              description="Voice-only consultation optimized for low bandwidth areas"
              doctorName="Priya Sharma"
              specialty="General Medicine"
              onConsult={() => console.log("Starting audio consultation")}
              onCancel={() => console.log("Cancelling consultation")}
              onReschedule={() => console.log("Rescheduling consultation")}
            />
            <ConsultCard
              type="async"
              title="Message Doctor"
              description="Share symptoms and get expert medical advice through secure messaging"
              eta="1 hour"
              onConsult={() => console.log("Starting async consultation")}
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
                  <Button variant="outline" size="sm" className="w-full mt-3">
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
            <Button variant="consult" size="lg">
              <Users className="h-5 w-5 mr-2" />
              View All 5000+ Doctors
            </Button>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Why Choose SwasthSetu for Human Healthcare?</h3>
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
            <Button variant="secondary" size="lg">
              <Phone className="h-5 w-5 mr-2" />
              Call 108 (Emergency)
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-destructive">
              <Phone className="h-5 w-5 mr-2" />
              Call 102 (Medical)
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Human;