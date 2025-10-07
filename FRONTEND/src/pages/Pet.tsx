import { useState } from "react";
import "./tabFloatEffect.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConsultCard from "@/components/ConsultCard";
import VideoCall from "@/components/VideoCall";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar,
  Shield,
  Clock,
  Users,
  Star,
  Dog,
  Cat,
  Rabbit
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Pet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedVet, setSelectedVet] = useState<{ name: string; specialty: string } | null>(null);


  const petServices = [
    { name: "General Veterinary", vets: 200, available: 15, icon: Heart },
    { name: "Pet Behavior", vets: 50, available: 5, icon: Dog },
    { name: "Pet Nutrition", vets: 75, available: 8, icon: Cat },
    { name: "Emergency Care", vets: 30, available: 3, icon: Shield },
    { name: "Vaccinations", vets: 100, available: 12, icon: Star },
    { name: "Dental Care", vets: 40, available: 4, icon: Rabbit }
  ];

  const availableVets = [
    {
      name: "Anita Verma",
      specialty: "General Veterinary",
      experience: "10+ years",
      rating: 4.9,
      languages: ["Hindi", "English"],
      location: "Bangalore",
      availability: "Available now",
      isOnline: true
    },
    {
      name: "Rohit Singh",
      specialty: "Pet Behavior",
      experience: "7+ years",
      rating: 4.7,
      languages: ["Hindi", "English", "Punjabi"],
      location: "Delhi",
      availability: "Next: 20 min",
      isOnline: false
    },
    {
      name: "Kavya Nair", 
      specialty: "Pet Nutrition",
      experience: "5+ years",
      rating: 4.8,
      languages: ["Hindi", "English", "Malayalam"],
      location: "Kerala",
      availability: "Available now",
      isOnline: true
    }
  ];

  const petTypes = [
    { name: "Dogs", count: "80% of consultations", icon: "🐕" },
    { name: "Cats", count: "15% of consultations", icon: "🐱" },
    { name: "Birds", count: "3% of consultations", icon: "🦜" },
    { name: "Others", count: "2% of consultations", icon: "🐰" }
  ];

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
              <div className="p-2 rounded-lg bg-secondary/10">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pet Healthcare</h1>
                <p className="text-sm text-muted-foreground">Expert veterinary care for your beloved pets</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-block feature-highlight text-sm font-medium">
            🐾 Trusted by 50,000+ pet parents across India
          </div>
          <h2 className="text-4xl font-bold">
            Your Pet's Health
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent block">
              Our Priority
            </span>
          </h2>
          <p className="text-xl trust-text max-w-3xl mx-auto">
            Connect with certified veterinarians for expert pet care. From routine checkups 
            to emergency consultations, we're here for your furry family members.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="consult" size="lg" onClick={() => {
              setSelectedVet({ name: "Anita Verma", specialty: "General Veterinary" });
              setShowVideoCall(true);
            }}>
              <Video className="h-5 w-5 mr-2" />
              Start Vet Consultation
            </Button>
            <Button variant="medical" size="lg" onClick={() => setShowSchedule(true)}>
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Pet Checkup
            </Button>
          </div>
        </div>

        {/* Pet Types Served */}
        <section className="wellness-gradient rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">We Care for All Pets</h3>
            <p className="trust-text">Professional veterinary care for every type of pet</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {petTypes.map((pet, index) => (
              <Card key={index} className="consultation-card text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{pet.icon}</div>
                  <h4 className="font-semibold text-lg mb-2">{pet.name}</h4>
                  <p className="text-sm text-muted-foreground">{pet.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Consultation Options */}
        <section>
          <h3 className="text-2xl font-bold text-center mb-8">
            Choose Your Pet Consultation Type
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <ConsultCard
              type="video"
              title="Video Pet Consultation"
              description="Show your pet to the vet with HD video for accurate diagnosis"
              eta="5 min"
              queuePosition={2}
              totalQueue={8}
              onConsult={() => {
                setSelectedVet({ name: "Anita Verma", specialty: "General Veterinary" });
                setShowVideoCall(true);
              }}
            />
            <ConsultCard
              type="audio"
              title="Audio Pet Consultation"
              description="Discuss pet symptoms and behavior with veterinary experts"
              doctorName="Anita Verma"
              specialty="General Veterinary"
              onConsult={() => {
                setSelectedVet({ name: "Anita Verma", specialty: "General Veterinary" });
                setShowVideoCall(true);
              }}
              onCancel={() => console.log("Cancelling pet consultation")}
              onReschedule={() => console.log("Rescheduling pet consultation")}
            />
            <ConsultCard
              type="async"
              title="Pet Care Messages"
              description="Send photos and details about your pet's condition for expert advice"
              eta="30 min"
              onConsult={() => navigate('/?tab=chatbot&context=pet')}
            />
          </div>
        </section>

        {/* Veterinary Services */}
        <section className="py-12 bg-muted/30 -mx-4 px-4 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Veterinary Services</h3>
            <p className="trust-text">Comprehensive pet healthcare across all specialties</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {petServices.map((service, index) => (
              <Card key={index} className="consultation-card hover-scale cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <service.icon className="h-5 w-5 text-secondary" />
                      <h4 className="font-semibold">{service.name}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-success text-sm">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      {service.available} online
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.vets} veterinarians available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => {
                      setSelectedService(service.name);
                      setShowSpecialists(true);
                    }}
                  >
                    View Specialists
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Available Veterinarians */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Top Available Veterinarians</h3>
            <p className="trust-text">Connect with certified pet healthcare professionals</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {availableVets.map((vet, index) => (
              <Card key={index} className="doctor-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center border-2 border-secondary/20">
                        <span className="text-secondary font-semibold text-lg">
                          {vet.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {vet.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-success rounded-full border-2 border-background pulse-glow" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          Dr. {vet.name}
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            {vet.rating}
                          </div>
                        </div>
                        
                        <div className="text-sm text-secondary font-medium">
                          {vet.specialty}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {vet.experience} experience
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {vet.languages.join(', ')}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-foreground">
                            {vet.availability}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            vet.isOnline 
                              ? "bg-success/10 text-success border border-success/20" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {vet.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="consult" size="lg" onClick={() => setShowSpecialists(true)}>
              <Users className="h-5 w-5 mr-2" />
              View All 500+ Veterinarians
            </Button>
          </div>
        </section>

        {/* Pet Care Features */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Why Choose PAWMANITY for Pet Healthcare?</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="consultation-card">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-secondary/10 w-fit">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">Certified Veterinarians</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="trust-text">
                  All veterinarians are certified by Veterinary Council of India with valid licenses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="consultation-card">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-accent/10 w-fit">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Emergency Pet Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="trust-text">
                  24/7 emergency veterinary support for urgent pet health situations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="consultation-card">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Comprehensive Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="trust-text">
                  From routine checkups to specialized treatments for all types of pets.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pet Emergency Contact */}
        <section className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-8 text-center border border-secondary/20">
          <h3 className="text-2xl font-bold mb-4 text-secondary">Pet Emergency?</h3>
          <p className="text-lg trust-text mb-6">
            For urgent pet health situations, connect with emergency veterinarians immediately
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="emergency" 
              size="lg" 
              onClick={() => window.open('tel:102', '_self')}
            >
              <Phone className="h-5 w-5 mr-2" />
              Emergency Vet Call
            </Button>
            <Button 
              variant="consult" 
              size="lg" 
              onClick={() => navigate('/?tab=chatbot&context=pet')}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Quick Vet Chat
            </Button>
          </div>
        </section>

        {/* Schedule Dialog */}
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Pet Checkup</DialogTitle>
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
                  appts.push({ kind: 'pet', date: scheduleDate, time: scheduleTime, createdAt: new Date().toISOString() });
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
              <DialogTitle>{selectedService ? `${selectedService} Specialists` : 'All Veterinarians'}</DialogTitle>
              <DialogDescription>Select a vet to start chat.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {availableVets
                .filter(v => !selectedService || v.specialty === selectedService)
                .map((vet, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Dr. {vet.name}</div>
                      <div className="text-sm text-muted-foreground">{vet.specialty} • {vet.availability}</div>
                    </div>
                    <Button size="sm" onClick={() => {
                      setSelectedVet({ name: vet.name, specialty: vet.specialty });
                      setShowVideoCall(true);
                    }}>Start Video Call</Button>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Call Modal */}
        {showVideoCall && selectedVet && (
          <VideoCall
            consultationType="pet"
            doctorName={selectedVet.name}
            specialty={selectedVet.specialty}
            onEndCall={() => {
              setShowVideoCall(false);
              setSelectedVet(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Pet;