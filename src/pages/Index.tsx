import { Button } from "@/components/ui/button";
import "./tabFloatEffect.css";
import { Card, CardContent } from "@/components/ui/card";
import ConsultCard from "@/components/ConsultCard";
import DoctorCard from "@/components/DoctorCard";
import FeatureCard from "@/components/FeatureCard";
import { 
  Shield, 
  Clock, 
  Globe, 
  Heart, 
  Users, 
  Download,
  Star,
  CheckCircle,
  Zap
} from "lucide-react";
import heroImage from "@/assets/telemedicine-hero.jpg";
import techImage from "@/assets/healthcare-tech.jpg";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Cancel/Reschedule Anytime",
      description: "No more rigid time constraints. Cancel or reschedule your appointment anytime before consultation starts with one-tap reason codes.",
      highlight: "Fixed: Token Cancellation"
    },
    {
      icon: Clock,
      title: "Smart Hold & Auto-Callback",
      description: "Miss your slot? Stay in a 10-minute rolling window with automatic retries and PSTN fallback for poor connectivity.",
      highlight: "Fixed: Time Constraints"
    },
    {
      icon: Globe,
      title: "Multilingual & Offline Support",
      description: "Available in 12+ Indian languages with offline booking, SMS/IVR flows, and low-bandwidth audio-only mode.",
      highlight: "India-First Design"
    },
    {
      icon: Heart,
      title: "Continuity of Care",
      description: "Select 'My Doctor', maintain 72-hour post-visit chat, family profiles, and personalized care plans.",
      highlight: "Human Touch"
    },
    {
      icon: Users,
      title: "Smart Doctor Routing",
      description: "Pooled availability across states with surge routing, waitlist ETA, and priority for elderly/maternal/pediatric care.",
      highlight: "Better Access"
    },
    {
      icon: Shield,
      title: "End-to-End Security",
      description: "DTLS-SRTP encryption, consent ledger, ABDM integration, and granular privacy controls you can trust.",
      highlight: "Data Protection"
    }
  ];

  const mockDoctors = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block feature-highlight text-sm font-medium">
                  स्वास्थ सेतु - The Health Bridge
                </div>
                <h1 className="text-5xl font-bold leading-tight">
                  Modern Healthcare
                  <span className="medical-heading block">
                    {" "}for Every Indian
                  </span>
                </h1>
                <p className="text-xl trust-text max-w-lg">
                  SwasthSetu bridges patients, doctors, and public health systems with 
                  flexible scheduling, multilingual support, and reliable connectivity 
                  that works everywhere in India.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="text-lg px-8 tab-float-effect" onClick={() => window.location.href = '/human'}>
                  Human Healthcare
                </Button>
                <Button variant="medical" size="lg" className="text-lg px-8 tab-float-effect" onClick={() => window.location.href = '/pet'}>
                  Pet Healthcare
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10L+</div>
                  <div className="text-sm text-muted-foreground">Consultations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">5000+</div>
                  <div className="text-sm text-muted-foreground">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">12+</div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Indian family connecting with doctor through telemedicine"
                className="rounded-2xl shadow-[var(--shadow-consultation)] hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Healthcare Journey
            </h2>
            <p className="text-xl trust-text max-w-2xl mx-auto">
              Choose how you'd like to connect with healthcare professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ConsultCard
              type="video"
              title="Video Consultation"
              description="Face-to-face consultation with HD video quality and screen sharing capabilities"
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
              description="Share your symptoms and get expert medical advice through secure messaging"
              eta="1 hour"
              onConsult={() => console.log("Starting async consultation")}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why SwasthSetu is Different
            </h2>
            <p className="text-xl trust-text max-w-3xl mx-auto">
              We've reimagined telemedicine to address real challenges faced by 
              patients and doctors across India, making healthcare truly accessible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Available Doctors */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Connect with Trusted Doctors
            </h2>
            <p className="text-xl trust-text">
              Our network of verified healthcare professionals is ready to help
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            {mockDoctors.map((doctor, index) => (
              <DoctorCard key={index} {...doctor} />
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="consult" size="lg">
              View All Doctors
            </Button>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Built for India's Digital Healthcare Future
              </h2>
              <p className="text-xl trust-text">
                Our platform combines cutting-edge technology with deep understanding 
                of India's diverse healthcare needs, ensuring reliable service from 
                metro cities to remote villages.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>ABDM integration for seamless health records</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Adaptive streaming for 2G to 5G networks</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>AI-powered triage in local languages</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>End-to-end encryption for data security</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="medical" size="lg">
                  Learn More About Our Technology
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={techImage} 
                alt="Healthcare technology and connectivity across India"
                className="rounded-2xl shadow-[var(--shadow-consultation)] hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl opacity-90">
              Join millions of Indians who trust SwasthSetu for their healthcare needs. 
              Get started today and experience the future of telemedicine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                <Download className="mr-2 h-5 w-5" />
                Download Mobile App
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 text-white border-white hover:bg-white hover:text-primary">
                Book Your First Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">SwasthSetu</h3>
              <p className="text-background/70">
                Bridging healthcare gaps across India with modern telemedicine 
                that works for everyone.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Services</h4>
              <div className="space-y-2 text-background/70">
                <div>Video Consultation</div>
                <div>Audio Consultation</div>
                <div>Async Messaging</div>
                <div>E-Prescriptions</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Support</h4>
              <div className="space-y-2 text-background/70">
                <div>Help Center</div>
                <div>Doctor Support</div>
                <div>Technical Help</div>
                <div>Emergency Care</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Legal</h4>
              <div className="space-y-2 text-background/70">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>ABDM Compliance</div>
                <div>Data Security</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-12 pt-8 text-center">
            <p className="text-background/70">
              © 2024 SwasthSetu. Making healthcare accessible for every Indian.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;