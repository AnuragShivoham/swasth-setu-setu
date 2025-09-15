import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Languages, Phone, MapPin, User, FileText, Award, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import GradientBlinds from "./GradientBlinds";
import Beams from "../components/Beams";

interface DoctorProfile {
  id: number;
  name: string;
  specialization: string;
  license_number: string;
  experience_years?: number;
  phone?: string;
  bio?: string;
  qualifications?: string;
  is_available: boolean;
}

const Doctor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const previousPathnameRef = useRef<string | null>(null);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      console.log("Fetching doctor profile...");
      const res = await fetch(`http://localhost:5000/doctor/profile?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "GET",
      });
      console.log("Response status:", res.status);
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      const data = await res.json();
      console.log("Profile data received:", data);
      if (!data.error) {
        setProfile(data);
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch doctor profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token, refreshTrigger]);

  useEffect(() => {
    if (previousPathnameRef.current === '/edit-profile' && location.pathname === '/doctor') {
      setRefreshTrigger(prev => prev + 1);
    }
    previousPathnameRef.current = location.pathname;
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-white p-6 font-serif text-forest-green flex items-center justify-center">
        <p className="text-xl italic">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream-white p-6 font-serif text-forest-green flex items-center justify-center">
        <p className="text-xl italic">Doctor profile not found. Please contact administrator.</p>
        <button
          className="mt-4 px-4 py-2 bg-forest-green text-cream-white rounded italic"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 font-serif text-forest-green relative overflow-hidden">
      <div className="absolute inset-0 brightness-75 contrast-125 -z-10">
        <Beams beamWidth={3} beamHeight={20} beamNumber={15} lightColor="#228B22" speed={1.5} noiseIntensity={1.5} scale={0.3} rotation={15} />
      </div>
      <div className="max-w-4xl mx-auto space-y-6 relative z-10 bg-white/60 backdrop-blur-lg shadow-lg rounded-2xl p-8 mx-4" style={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #F0F8FF 50%, #E6E6FA 100%)' }}>
        {/* Profile Header */}
        <Card className="border-2 border-forest-green shadow-lg relative">
          <GradientBlinds
            gradientColors={['#228B22', '#FFF8DC']}
            isHovered={isHovered}
          />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-forest-green" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold italic text-forest-green">
                    Dr. {profile.name}
                  </CardTitle>
                  <p className="text-lg italic text-forest-green/80">{profile.specialization}</p>
                  <p className="text-sm italic text-forest-green/60">License: {profile.license_number}</p>
                </div>
              </div>
              <Badge
                variant={profile.is_available ? "default" : "secondary"}
                className={`italic ${profile.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {profile.is_available ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details in Tabs */}
        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-50 border-2 border-slate-300">
            <TabsTrigger
              value="professional"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white italic hover:bg-blue-500 hover:text-white transition-colors"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Award className="w-4 h-4 mr-2" />
              Professional
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white italic hover:bg-purple-500 hover:text-white transition-colors"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white italic hover:bg-indigo-500 hover:text-white transition-colors"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <FileText className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professional" className="mt-6">
            <Card
              className="border-2 border-forest-green shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <GradientBlinds
                gradientColors={['#228B22', '#FFF8DC']}
                isHovered={isHovered}
              />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold italic text-forest-green flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 hover:bg-forest-green/5 p-2 rounded transition-colors">
                  <Star className="h-5 w-5 text-forest-green" />
                  <span className="italic">Specialization: {profile.specialization}</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-forest-green/5 p-2 rounded transition-colors">
                  <Clock className="h-5 w-5 text-forest-green" />
                  <span className="italic">
                    Experience: {profile.experience_years ? `${profile.experience_years} years` : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-3 hover:bg-forest-green/5 p-2 rounded transition-colors">
                  <Languages className="h-5 w-5 text-forest-green" />
                  <span className="italic">Languages: English, Hindi</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-forest-green/5 p-2 rounded transition-colors">
                  <Award className="h-5 w-5 text-forest-green" />
                  <span className="italic">Qualifications: {profile.qualifications || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card
              className="border-2 border-forest-green shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <GradientBlinds
                gradientColors={['#228B22', '#FFF8DC']}
                isHovered={isHovered}
              />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold italic text-forest-green flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 hover:bg-forest-green/5 p-2 rounded transition-colors">
                  <Phone className="h-5 w-5 text-forest-green" />
                  <span className="italic">{profile.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-forest-green/5 p-2 rounded transition-colors">
                  <MapPin className="h-5 w-5 text-forest-green" />
                  <span className="italic">Location: Virtual Clinic</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card
              className="border-2 border-forest-green shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <GradientBlinds
                gradientColors={['#228B22', '#FFF8DC']}
                isHovered={isHovered}
              />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold italic text-forest-green flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic text-forest-green/80 leading-relaxed hover:text-forest-green transition-colors">
                  {profile.bio || "No bio available."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            className="bg-forest-green text-cream-white hover:bg-forest-green/90 italic"
            onClick={() => navigate('/doctor-patients')}
          >
            View My Patients
          </Button>
          <Button
            variant="outline"
            className="border-forest-green text-forest-green hover:bg-forest-green hover:text-cream-white italic"
            onClick={() => {
              // Navigate to edit profile page
              navigate('/edit-profile');
            }}
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Doctor;
