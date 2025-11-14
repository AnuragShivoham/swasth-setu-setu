import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Heart, MessageCircle, Settings, Stethoscope, Phone, Image as ImageIcon, Calendar } from "lucide-react";
import manWithDogImage from "@/assets/man-with-dog.jpg";
import DoctorChatbot from "@/components/DoctorChatbot";
import PhotoDiagnosis from "@/components/PhotoDiagnosis";
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
              <Stethoscope className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">PAWMANITY</h1>
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
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Doctor Chat
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photo Diagnosis
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
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
            <div className="relative max-w-4xl mx-auto">
              <img 
                src={manWithDogImage} 
                alt="Man holding a dog - click for healthcare services"
                className="w-full h-auto rounded-2xl shadow-[var(--shadow-consultation)]"
              />
              
              {/* Clickable Overlays */}
              <div className="absolute inset-0 flex">
                {/* Human Healthcare Area - Left Side */}
                <button
                  onClick={() => navigate('/human')}
                  className="flex-1 group relative overflow-hidden rounded-l-2xl hover:bg-primary/10 transition-all duration-300"
                  aria-label="Human Healthcare Services"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <User className="h-5 w-5" />
                        Human Healthcare
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Telemedicine for people
                      </p>
                    </div>
                  </div>
                </button>

                {/* Pet Healthcare Area - Right Side */}
                <button
                  onClick={() => navigate('/pet')}
                  className="flex-1 group relative overflow-hidden rounded-r-2xl hover:bg-secondary/10 transition-all duration-300"
                  aria-label="Pet Healthcare Services"
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
                      <div className="flex items-center gap-2 text-secondary font-semibold">
                        <Heart className="h-5 w-5" />
                        Pet Healthcare
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Veterinary telemedicine
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Service Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card 
                className="consultation-card hover-scale cursor-pointer"
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
                  <Button variant="hero" className="w-full mt-4">
                    Access Human Healthcare
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="consultation-card hover-scale cursor-pointer"
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
                  <Button variant="consult" className="w-full mt-4">
                    Access Pet Healthcare
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button variant="medical" size="lg" onClick={() => navigate('/human')}>
                <MessageCircle className="h-5 w-5 mr-2" />
                Quick Consultation
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = 'tel:102'}>
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

          <TabsContent value="history">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Consultation & Appointment History</h2>
                <p className="text-muted-foreground">View your past consultations and scheduled appointments</p>
              </div>

              {/* Appointments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Scheduled Appointments
                  </CardTitle>
                  <CardDescription>Your upcoming and past appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                      return appointments.length > 0 ? (
                        appointments.map((appt: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium capitalize">{appt.kind} Healthcare</div>
                              <div className="text-sm text-muted-foreground">
                                {appt.date} at {appt.time}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">Scheduled</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(appt.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No appointments scheduled yet
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Communication Requests Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Communication Requests
                  </CardTitle>
                  <CardDescription>Your consultation requests and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const requests = JSON.parse(localStorage.getItem('communication_requests') || '[]');
                      return requests.length > 0 ? (
                        requests.map((req: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Dr. {req.doctorName}</div>
                              <div className="text-sm text-muted-foreground">
                                {req.type.charAt(0).toUpperCase() + req.type.slice(1)} consultation • {req.reason}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                req.status === 'pending' ? 'text-yellow-600' :
                                req.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No communication requests yet
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
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