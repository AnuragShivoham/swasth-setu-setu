import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Video, Phone, MessageSquare, CheckCircle, XCircle, User } from "lucide-react";
import VideoCall from "@/components/VideoCall";

interface ConsultationRequest {
  id: string;
  patient_id: string;
  consultation_type: string;
  status: string;
  message: string;
  medical_profile_data: any;
  created_at: string;
  patient_profile?: {
    first_name: string;
    last_name: string;
  };
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeCall, setActiveCall] = useState<any>(null);

  useEffect(() => {
    loadDoctorData();
    subscribeToRequests();
  }, []);

  const loadDoctorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load doctor profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setDoctorProfile(profile);

      // Load consultation requests
      await loadRequests();
    } catch (error) {
      console.error("Error loading doctor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*")
      .or("status.eq.pending,status.eq.accepted")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Load patient profiles separately
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", request.patient_id)
            .single();
          
          return { ...request, patient_profile: profile };
        })
      );
      setRequests(requestsWithProfiles as any);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel("consultation-requests")
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

  const handleAcceptRequest = async (request: ConsultationRequest) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("consultation_requests")
        .update({
          status: "accepted",
          doctor_id: user?.id,
        })
        .eq("id", request.id);

      if (error) throw error;

      toast({
        title: "Request Accepted",
        description: "You can now start the consultation.",
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

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("consultation_requests")
        .update({ status: "declined" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request Declined",
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

  const handleSendMessage = async (request: ConsultationRequest) => {
    if (!replyMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("consultation_messages")
        .insert({
          consultation_request_id: request.id,
          from_user_id: user?.id,
          to_user_id: request.patient_id,
          message: replyMessage,
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
      });

      setReplyMessage("");
      setSelectedRequest(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartCall = (request: ConsultationRequest) => {
    setActiveCall({
      consultationType: "human",
      patientName: `${request.patient_profile?.first_name} ${request.patient_profile?.last_name}`,
      type: request.consultation_type,
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
        doctorName={`${doctorProfile?.first_name} ${doctorProfile?.last_name}`}
        specialty="Doctor"
        onEndCall={() => setActiveCall(null)}
      />
    );
  }

  const getRequestIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Phone className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              Dr. {doctorProfile?.first_name} {doctorProfile?.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">
              Pending Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              My Patients ({acceptedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending requests
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {request.patient_profile?.first_name?.[0]}
                            {request.patient_profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {request.patient_profile?.first_name}{" "}
                            {request.patient_profile?.last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {getRequestIcon(request.consultation_type)}
                            {request.consultation_type} consultation
                          </CardDescription>
                        </div>
                      </div>
                      <Badge>{request.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Patient Message:</p>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    </div>

                    {request.medical_profile_data && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Medical Profile:</p>
                        <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                          {Object.entries(request.medical_profile_data).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}: </span>
                                <span>{String(value)}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(request)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No accepted consultations yet
                </CardContent>
              </Card>
            ) : (
              acceptedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {request.patient_profile?.first_name?.[0]}
                            {request.patient_profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {request.patient_profile?.first_name}{" "}
                            {request.patient_profile?.last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {getRequestIcon(request.consultation_type)}
                            {request.consultation_type} consultation
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{request.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {request.consultation_type !== "text" ? (
                      <Button onClick={() => handleStartCall(request)} className="w-full">
                        {request.consultation_type === "video" ? (
                          <Video className="h-4 w-4 mr-2" />
                        ) : (
                          <Phone className="h-4 w-4 mr-2" />
                        )}
                        Start {request.consultation_type} Call
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedRequest(request)}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {selectedRequest && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <CardDescription>
                Reply to {selectedRequest.patient_profile?.first_name}{" "}
                {selectedRequest.patient_profile?.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSendMessage(selectedRequest)}
                  className="flex-1"
                >
                  Send
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setReplyMessage("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
