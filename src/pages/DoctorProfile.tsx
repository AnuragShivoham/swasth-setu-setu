import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, Phone, Mail, Calendar, Award, Languages, Upload, Activity, Users, Clock, TrendingUp, Star, MessageSquare, Video, Phone as PhoneIcon } from "lucide-react";

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  languages: string[];
  location: string;
  bio: string;
  qualifications: string[];
  consultation_fee: number;
  availability: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  is_online: boolean;
  last_seen: string;
}

const DoctorProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialty: "",
    experience: "",
    languages: [] as string[],
    location: "",
    bio: "",
    qualifications: [] as string[],
    consultation_fee: 0,
    availability: {
      monday: { start: "09:00", end: "17:00", enabled: true },
      tuesday: { start: "09:00", end: "17:00", enabled: true },
      wednesday: { start: "09:00", end: "17:00", enabled: true },
      thursday: { start: "09:00", end: "17:00", enabled: true },
      friday: { start: "09:00", end: "17:00", enabled: true },
      saturday: { start: "09:00", end: "13:00", enabled: false },
      sunday: { start: "09:00", end: "13:00", enabled: false },
    }
  });

  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name,
          phone: data.phone,
          specialty: data.specialty,
          experience: data.experience,
          languages: data.languages,
          location: data.location,
          bio: data.bio,
          qualifications: data.qualifications,
          consultation_fee: data.consultation_fee,
          availability: data.availability
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const saveProfile = async () => {
    if (!formData.name || !formData.specialty || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const profileData = {
        ...formData,
        email: userEmail,
        is_online: true,
        last_seen: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("doctor_profiles")
        .upsert(profileData, { onConflict: "email" });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      loadDoctorProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOnlineStatus = async (status: boolean) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const { error } = await supabase
        .from("doctor_profiles")
        .update({
          is_online: status,
          last_seen: new Date().toISOString()
        })
        .eq("email", userEmail);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, is_online: status } : null);
      toast({
        title: "Status Updated",
        description: `You are now ${status ? "online" : "offline"}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const addLanguage = (language: string) => {
    if (language && !formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addQualification = (qualification: string) => {
    if (qualification && !formData.qualifications.includes(qualification)) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualification]
      }));
    }
  };

  const removeQualification = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage your professional profile and patient interactions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile?.is_online ? "🟢" : "🔴"}</div>
                <div className="text-sm text-gray-500">{profile?.is_online ? "Online" : "Offline"}</div>
              </div>
              <Button
                onClick={() => updateOnlineStatus(!profile?.is_online)}
                variant={profile?.is_online ? "destructive" : "default"}
                className="px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
              >
                <Activity className="h-4 w-4 mr-2" />
                Go {profile?.is_online ? "Offline" : "Online"}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Patients</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Today's Consultations</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Pending Requests</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Rating</p>
                    <p className="text-3xl font-bold">4.8</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <Video className="h-4 w-4 mr-2" />
                Start Video Consultation
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-green-50 hover:border-green-200 transition-all duration-300">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Audio Call Patient
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 transition-all duration-300">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-orange-50 hover:border-orange-200 transition-all duration-300">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white shadow-lg border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Video call with Priya Sharma</p>
                    <p className="text-xs text-gray-500">2 hours ago • 15 minutes</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Completed</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient request from Rajesh Kumar</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Accepted</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Chat consultation with Meera Patel</p>
                    <p className="text-xs text-gray-500">6 hours ago • 25 messages</p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Completed</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Updated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>Update your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-blue-100 shadow-lg">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {formData.name.split(' ').map(n => n[0]).join('') || 'DR'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dr. John Doe"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">Specialty *</Label>
                  <Select value={formData.specialty} onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}>
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Gynecology">Gynecology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="General Veterinary">General Veterinary</SelectItem>
                      <SelectItem value="Pet Behavior">Pet Behavior</SelectItem>
                      <SelectItem value="Pet Nutrition">Pet Nutrition</SelectItem>
                      <SelectItem value="Emergency Care">Emergency Care</SelectItem>
                      <SelectItem value="Vaccinations">Vaccinations</SelectItem>
                      <SelectItem value="Dental Care">Dental Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g., 8+ years"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="fee" className="text-sm font-medium text-gray-700">Consultation Fee (₹)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, consultation_fee: parseInt(e.target.value) || 0 }))}
                    placeholder="500"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Professional Details
              </CardTitle>
              <CardDescription>Your qualifications and languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Languages</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-all duration-300 px-3 py-1" onClick={() => removeLanguage(lang)}>
                      {lang} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addLanguage}>
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300">
                    <SelectValue placeholder="Add language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Bengali">Bengali</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                    <SelectItem value="Marathi">Marathi</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                    <SelectItem value="Gujarati">Gujarati</SelectItem>
                    <SelectItem value="Kannada">Kannada</SelectItem>
                    <SelectItem value="Odia">Odia</SelectItem>
                    <SelectItem value="Punjabi">Punjabi</SelectItem>
                    <SelectItem value="Malayalam">Malayalam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Qualifications</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.qualifications.map((qual) => (
                    <Badge key={qual} variant="outline" className="cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-300 px-3 py-1" onClick={() => removeQualification(qual)}>
                      {qual} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add qualification (e.g., MBBS, MD)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addQualification(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell patients about your experience and approach..."
                  rows={4}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Availability Schedule */}
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Availability Schedule
            </CardTitle>
            <CardDescription>Set your consultation hours for each day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(formData.availability).map(([day, schedule]) => (
                <div key={day} className={`space-y-2 p-4 border rounded-lg transition-all duration-300 ${schedule.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <Label className="capitalize font-medium text-gray-700">{day}</Label>
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          [day]: { ...schedule, enabled: e.target.checked }
                        }
                      }))}
                      className="rounded w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                  </div>
                  {schedule.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">Start</Label>
                        <Input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: { ...schedule, start: e.target.value }
                            }
                          }))}
                          className="text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">End</Label>
                        <Input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: { ...schedule, end: e.target.value }
                            }
                          }))}
                          className="text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveProfile} disabled={loading} size="lg">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
