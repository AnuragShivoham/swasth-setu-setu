import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Video, Phone, MessageSquare, Plus } from "lucide-react";
import VideoCall from "@/components/VideoCall";

interface ConsultationRequest {
  id: string;
  doctor_id?: string;
  consultation_type: string;
  status: string;
  message: string;
  created_at: string;
  doctor_profile?: {
    first_name: string;
    last_name: string;
  };
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [consultationType, setConsultationType] = useState<"video" | "audio" | "text">("video");
  const [requestMessage, setRequestMessage] = useState("");
  const [medicalInfo, setMedicalInfo] = useState({
    age: "",
    symptoms: "",
    allergies: "",
    currentMedications: "",
  });
  const [activeCall, setActiveCall] = useState<any>(null);

  useEffect(() => {
    loadPatientData();
    subscribeToRequests();
  }, []);

  const loadPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setPatientProfile(profile);

      await loadRequests();
    } catch (error) {
      console.error("Error loading patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Load doctor profiles separately
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          if (request.doctor_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name")
              .eq("user_id", request.doctor_id)
              .single();
            
            return { ...request, doctor_profile: profile };
          }
          return { ...request, doctor_profile: null };
        })
      );
      setRequests(requestsWithProfiles as any);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel("patient-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultation_requests",
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("consultation_requests")
        .insert({
          patient_id: user?.id,
          consultation_type: consultationType,
          message: requestMessage,
          medical_profile_data: medicalInfo,
        });

      if (error) throw error;

      toast({
        title: "Request Created",
        description: "A doctor will review your request soon.",
      });

      setShowRequestForm(false);
      setRequestMessage("");
      setMedicalInfo({
        age: "",
        symptoms: "",
        allergies: "",
        currentMedications: "",
      });
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleJoinCall = (request: ConsultationRequest) => {
    if (!request.doctor_profile) return;

    setActiveCall({
      consultationType: "human",
      doctorName: `${request.doctor_profile.first_name} ${request.doctor_profile.last_name}`,
      specialty: "Doctor",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (activeCall) {
    return (
      <VideoCall
        consultationType="human"
        doctorName={activeCall.doctorName}
        specialty={activeCall.specialty}
        onEndCall={() => setActiveCall(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
            <p className="text-muted-foreground">
              {patientProfile?.first_name} {patientProfile?.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Consultation Requests</h2>
          <Button onClick={() => setShowRequestForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No consultation requests yet</p>
                <Button onClick={() => setShowRequestForm(true)} className="mt-4">
                  Create Your First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {request.consultation_type === "video" && <Video className="h-5 w-5" />}
                        {request.consultation_type === "audio" && <Phone className="h-5 w-5" />}
                        {request.consultation_type === "text" && <MessageSquare className="h-5 w-5" />}
                        {request.consultation_type} Consultation
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {request.doctor_profile
                          ? `Dr. ${request.doctor_profile.first_name} ${request.doctor_profile.last_name}`
                          : "Waiting for doctor assignment"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        request.status === "accepted"
                          ? "secondary"
                          : request.status === "declined"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Your Message:</p>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>

                  {request.status === "accepted" && request.consultation_type !== "text" && (
                    <Button onClick={() => handleJoinCall(request)} className="w-full">
                      {request.consultation_type === "video" ? (
                        <Video className="h-4 w-4 mr-2" />
                      ) : (
                        <Phone className="h-4 w-4 mr-2" />
                      )}
                      Join Call
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {showRequestForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>New Consultation Request</CardTitle>
              <CardDescription>
                Fill in your details and a doctor will review your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label>Consultation Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={consultationType === "video" ? "default" : "outline"}
                      onClick={() => setConsultationType("video")}
                      className="w-full"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                    <Button
                      type="button"
                      variant={consultationType === "audio" ? "default" : "outline"}
                      onClick={() => setConsultationType("audio")}
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Audio
                    </Button>
                    <Button
                      type="button"
                      variant={consultationType === "text" ? "default" : "outline"}
                      onClick={() => setConsultationType("text")}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Doctor</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your concern..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Medical Information</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={medicalInfo.age}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, age: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symptoms">Current Symptoms</Label>
                      <Input
                        id="symptoms"
                        value={medicalInfo.symptoms}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, symptoms: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      value={medicalInfo.allergies}
                      onChange={(e) =>
                        setMedicalInfo({ ...medicalInfo, allergies: e.target.value })
                      }
                      placeholder="List any allergies..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      value={medicalInfo.currentMedications}
                      onChange={(e) =>
                        setMedicalInfo({
                          ...medicalInfo,
                          currentMedications: e.target.value,
                        })
                      }
                      placeholder="List any current medications..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
