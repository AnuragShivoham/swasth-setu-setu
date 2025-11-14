import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, Clock, User, FileText, Phone, Video, MessageSquare } from "lucide-react";

interface CommunicationRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  type: "video" | "audio" | "chat";
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  patientName: string;
}

interface PatientRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  urgency: string;
  symptoms?: string;
  medicalHistory?: string;
  documents?: any[];
  doctorName: string;
  doctorSpecialty: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface DoctorRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  onAcceptCommunication: (request: CommunicationRequest) => void;
  onAcceptPatient: (request: PatientRequest) => void;
}

const DoctorRequestsDialog = ({
  isOpen,
  onClose,
  doctorId,
  onAcceptCommunication,
  onAcceptPatient
}: DoctorRequestsDialogProps) => {
  const { toast } = useToast();
  const [communicationRequests, setCommunicationRequests] = useState<CommunicationRequest[]>([]);
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, doctorId]);

  const loadRequests = () => {
    // Load communication requests
    const commRequests = JSON.parse(localStorage.getItem("communication_requests") || "[]");
    const doctorCommRequests = commRequests.filter((req: CommunicationRequest) =>
      req.doctorId === doctorId && req.status === "pending"
    );
    setCommunicationRequests(doctorCommRequests);

    // Load patient requests
    const patRequests = JSON.parse(localStorage.getItem("patient_requests") || "[]");
    const doctorPatRequests = patRequests.filter((req: PatientRequest) =>
      req.doctorName === doctorId && req.status === "pending"
    );
    setPatientRequests(doctorPatRequests);
  };

  const handleCommunicationResponse = (request: CommunicationRequest, accept: boolean) => {
    const requests = JSON.parse(localStorage.getItem("communication_requests") || "[]");
    const updatedRequests = requests.map((req: CommunicationRequest) =>
      req.id === request.id
        ? { ...req, status: accept ? "accepted" : "rejected" }
        : req
    );
    localStorage.setItem("communication_requests", JSON.stringify(updatedRequests));

    if (accept) {
      onAcceptCommunication(request);
      toast({
        title: "Request Accepted",
        description: `${request.type} call request from ${request.patientName} has been accepted.`,
      });
    } else {
      toast({
        title: "Request Rejected",
        description: `${request.type} call request from ${request.patientName} has been rejected.`,
      });
    }

    loadRequests();
  };

  const handlePatientResponse = (request: PatientRequest, accept: boolean) => {
    const requests = JSON.parse(localStorage.getItem("patient_requests") || "[]");
    const updatedRequests = requests.map((req: PatientRequest) =>
      req.id === request.id
        ? { ...req, status: accept ? "accepted" : "rejected" }
        : req
    );
    localStorage.setItem("patient_requests", JSON.stringify(updatedRequests));

    if (accept) {
      onAcceptPatient(request);
      toast({
        title: "Patient Request Accepted",
        description: `${request.name} has been added to your patient list.`,
      });
    } else {
      toast({
        title: "Patient Request Rejected",
        description: `Patient request from ${request.name} has been rejected.`,
      });
    }

    loadRequests();
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-600" />;
      case "audio": return <Phone className="h-4 w-4 text-green-600" />;
      case "chat": return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "destructive";
      case "high": return "destructive";
      case "normal": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Requests & Communication</DialogTitle>
          <DialogDescription>
            Manage incoming patient requests and communication requests
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="communication" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communication ({communicationRequests.length})
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Requests ({patientRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communication" className="space-y-4">
            {communicationRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending communication requests</p>
              </div>
            ) : (
              communicationRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getRequestTypeIcon(request.type)}
                          <span className="font-medium capitalize">{request.type} Call Request</span>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(request.createdAt).toLocaleString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          From: <span className="font-medium">{request.patientName}</span>
                        </p>
                        <p className="text-sm mb-3">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCommunicationResponse(request, false)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCommunicationResponse(request, true)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            {patientRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending patient requests</p>
              </div>
            ) : (
              patientRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{request.name}</span>
                          <Badge variant={getUrgencyColor(request.urgency) as any}>
                            {request.urgency}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(request.createdAt).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <strong>Email:</strong> {request.email}
                          </div>
                          <div>
                            <strong>Phone:</strong> {request.phone}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p>
                            <strong>Reason:</strong> {request.reason}
                          </p>
                          {request.symptoms && (
                            <p>
                              <strong>Symptoms:</strong> {request.symptoms}
                            </p>
                          )}
                          {request.medicalHistory && (
                            <p>
                              <strong>Medical History:</strong> {request.medicalHistory}
                            </p>
                          )}
                          {request.documents && request.documents.length > 0 && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">
                                {request.documents.length} document(s) attached
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePatientResponse(request, false)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePatientResponse(request, true)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorRequestsDialog;
