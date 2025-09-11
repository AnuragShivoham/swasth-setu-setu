import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Heart, MessageCircle, Settings, Stethoscope, Phone, Image as ImageIcon } from "lucide-react";
import manWithDogImage from "@/assets/man-with-dog.jpg";
import DoctorChatbot from "@/components/DoctorChatbot";
import PhotoDiagnosis from "@/components/PhotoDiagnosis";
import logoTop from "@/assets/logo_top.jpg";
import './tabFloatEffect.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("tab") || "services";
  const [activeTab, setActiveTab] = useState(initialTab);
  const context = params.get("context");
  const chatInitial = context === "pet" ? "My pet needs help" : context === "human" ? "I need a doctor consultation" : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoTop} alt="PAWMANITY Logo" className="h-10 w-auto" />
              <h1 className="text-2xl font-bold">PAWMANITY</h1>
            </div>
            <Button variant="outline" onClick={() => setActiveTab("settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="services" className="tab-float-effect hanging-shadow flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="tab-float-effect hanging-shadow flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Doctor Chat
            </TabsTrigger>
            <TabsTrigger value="photo" className="tab-float-effect hanging-shadow flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photo Diagnosis
            </TabsTrigger>
            <TabsTrigger value="settings" className="tab-float-effect hanging-shadow flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold">
                Choose Your Healthcare Service
              </h2>
              <p className="text-xl trust-text max-w-2xl mx-auto">
                PAWMANITY provides comprehensive healthcare for both humans and pets. 
                Click on the image below to get started.
              </p>
            </div>

            {/* Interactive Image */}
            <div className="relative max-w-4xl mx-auto tab-float-effect hanging-shadow">
                <img 
                  src={manWithDogImage} 
                  alt="Man holding a dog - click for healthcare services"
                  className="w-full h-auto rounded-2xl shadow-[var(--shadow-consultation)] animate-float-slow tab-float-effect hanging-shadow"
                />
              
              {/* Clickable Overlays */}
              <div className="absolute inset-0 flex">
                {/* Pet Healthcare Area - Left Side */}
                <button
                  onClick={() => navigate('/pet')}
                  className="flex-1 group relative overflow-hidden rounded-l-2xl hover:bg-secondary/10 transition-all duration-300 animate-float-pet delay-2000 group/hanging"
                  aria-label="Pet Healthcare Services"
                >
                  <div className="absolute inset-y-0 left-0 w-1/2 flex items-end justify-start">
                    <div className="mb-4 ml-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2 text-secondary font-semibold">
                        <Heart className="h-5 w-5" />
                        Pet Healthcare
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Veterinary telemedicine
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-l from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                {/* Human Healthcare Area - Right Side */}
                <button
                  onClick={() => navigate('/human')}
                  className="flex-1 group relative overflow-hidden rounded-r-2xl hover:bg-primary/10 transition-all duration-300 animate-float-human delay-1000 group/hanging"
                  aria-label="Human Healthcare Services"
                >
                  <div className="absolute inset-y-0 right-0 w-1/2 flex items-end justify-end">
                    <div className="mb-4 mr-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <User className="h-5 w-5" />
                        Human Healthcare
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Telemedicine for people
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            {/* Service Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card 
                className="consultation-card hover-scale cursor-pointer tab-float-effect hanging-shadow"
                onClick={() => navigate('/human')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Human Healthcare</CardTitle>
                      <CardDescription>Complete medical care for people</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Video/Audio consultations</li>
                    <li>• 12+ Indian languages</li>
                    <li>• 5000+ verified doctors</li>
                    <li>• Emergency support 24/7</li>
                  </ul>
                  <Button variant="hero" className="w-full mt-4 tab-float-effect hanging-shadow">
                    Access Human Healthcare
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="consultation-card hover-scale cursor-pointer tab-float-effect hanging-shadow"
                onClick={() => navigate('/pet')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Heart className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Pet Healthcare</CardTitle>
                      <CardDescription>Veterinary care for your beloved pets</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Expert veterinarians</li>
                    <li>• Behavioral consultations</li>
                    <li>• Emergency pet care</li>
                    <li>• Nutrition guidance</li>
                  </ul>
                  <Button variant="consult" className="w-full mt-4 tab-float-effect hanging-shadow">
                    Access Pet Healthcare
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button variant="medical" size="lg" onClick={() => setActiveTab("chatbot")}>
                <MessageCircle className="h-5 w-5 mr-2" />
                Quick Consultation
              </Button>
              <Button variant="outline" size="lg">
                <Phone className="h-5 w-5 mr-2" />
                Emergency: 102
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <DoctorChatbot initialMessage={chatInitial ?? undefined} />
          </TabsContent>
          <TabsContent value="photo">
            <PhotoDiagnosis />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your PAWMANITY preferences and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Account Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Language</div>
                        <div className="text-sm text-muted-foreground">Choose your preferred language</div>
                      </div>
                      <Button variant="outline" size="sm">Hindi</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Notifications</div>
                        <div className="text-sm text-muted-foreground">Consultation reminders and updates</div>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Emergency Contacts</div>
                        <div className="text-sm text-muted-foreground">Manage your emergency contacts</div>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Privacy & Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">ABDM Integration</div>
                        <div className="text-sm text-muted-foreground">Connect with Ayushman Bharat Digital Mission</div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Data Sharing</div>
                        <div className="text-sm text-muted-foreground">Control how your health data is shared</div>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" size="sm">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;