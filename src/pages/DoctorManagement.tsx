import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Calendar,
  Phone,
  Mail,
  Edit,
  Trash2,
  FileText,
  UserPlus,
  Video,
  MessageSquare,
  PhoneCall,
  Bell,
  History
} from "lucide-react";
import PatientForm from "@/components/PatientForm";
import MedicalHistory from "@/components/MedicalHistory";
import VideoCall from "@/components/VideoCall";
import AudioCall from "@/components/AudioCall";
import ChatComponent from "@/components/ChatComponent";
import DoctorRequestsDialog from "@/components/DoctorRequestsDialog";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  createdAt: string;
  lastVisit?: string;
}

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

const DoctorManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Check authentication
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "doctor") {
      navigate("/login");
      return;
    }
    loadPatients();
    loadPendingRequestsCount();
  }, [navigate]);

  const loadPatients = () => {
    const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients(storedPatients);
  };

  const loadPendingRequestsCount = () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const commRequests = JSON.parse(localStorage.getItem("communication_requests") || "[]");
    const patRequests = JSON.parse(localStorage.getItem("patient_requests") || "[]");

    const doctorCommRequests = commRequests.filter((req: CommunicationRequest) =>
      req.doctorId === userEmail && req.status === "pending"
    );

    const doctorPatRequests = patRequests.filter((req: PatientRequest) =>
      req.doctorName === userEmail && req.status === "pending"
    );

    setPendingRequestsCount(doctorCommRequests.length + doctorPatRequests.length);
  };

  const savePatients = (updatedPatients: Patient[]) => {
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
  };

  const handleAddPatient = (patientData: Omit<Patient, "id" | "createdAt">) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedPatients = [...patients, newPatient];
    savePatients(updatedPatients);

    toast({
      title: "Patient added successfully",
      description: `${newPatient.name} has been added to your patient list.`,
    });

    setShowPatientForm(false);
  };

  const handleEditPatient = (patientData: Omit<Patient, "id" | "createdAt">) => {
    if (!editingPatient) return;

    const updatedPatient: Patient = {
      ...editingPatient,
      ...patientData,
    };

    const updatedPatients = patients.map(p =>
      p.id === editingPatient.id ? updatedPatient : p
    );
    savePatients(updatedPatients);

    toast({
      title: "Patient updated successfully",
      description: `${updatedPatient.name}'s information has been updated.`,
    });

    setEditingPatient(null);
    setShowPatientForm(false);
  };

  const handleDeletePatient = (patientId: string) => {
    const patientToDelete = patients.find(p => p.id === patientId);
    const updatedPatients = patients.filter(p => p.id !== patientId);
    savePatients(updatedPatients);

    toast({
      title: "Patient removed",
      description: `${patientToDelete?.name} has been removed from your patient list.`,
    });
  };

  const handleViewMedicalHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowMedicalHistory(true);
  };

  const handleStartVideoCall = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowVideoCall(true);
  };

  const handleStartAudioCall = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAudioCall(true);
  };

  const handleStartChat = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowChat(true);
  };

  const handleAcceptCommunication = (request: CommunicationRequest) => {
    // Start the communication based on type
    if (request.type === "video") {
      setShowVideoCall(true);
    } else if (request.type === "audio") {
      setShowAudioCall(true);
    } else if (request.type === "chat") {
      setShowChat(true);
    }
    loadPendingRequestsCount();
  };

  const handleAcceptPatient = (request: PatientRequest) => {
    // Add patient to the doctor's list
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: request.name,
      email: request.email,
      phone: request.phone,
      patientId: `PAT-${Date.now()}`,
      dateOfBirth: "", // Would need to be collected separately
      gender: "", // Would need to be collected separately
      address: "", // Would need to be collected separately
      emergencyContact: "", // Would need to be collected separately
      medicalHistory: request.medicalHistory ? [request.medicalHistory] : [],
      createdAt: new Date().toISOString(),
    };

    const updatedPatients = [...patients, newPatient];
    savePatients(updatedPatients);
    loadPendingRequestsCount();
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Patient Management</h1>
                  <p className="text-sm text-muted-foreground">Manage your patients and their medical records</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRequestsDialog(true)}
                className="relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                Requests
                {pendingRequestsCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate('/home?tab=history')}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
              <Button onClick={() => setShowPatientForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4">
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{patients.length}</div>
                <div className="text-xs text-muted-foreground">Total Patients</div>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {patients.filter(p => p.lastVisit && new Date(p.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-xs text-muted-foreground">Active (30 days)</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Patients List */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No patients found" : "No patients yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start by adding your first patient to begin managing their healthcare records."
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowPatientForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Patient
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{patient.name}</h3>
                            <Badge variant="outline">{patient.patientId}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {patient.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span>Gender: <Badge variant="secondary">{patient.gender}</Badge></span>
                            {patient.lastVisit && (
                              <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Communication Buttons */}
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartVideoCall(patient)}
                          title="Start Video Call"
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartAudioCall(patient)}
                          title="Start Audio Call"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartChat(patient)}
                          title="Start Chat"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMedicalHistory(patient)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          History
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPatient(patient);
                            setShowPatientForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${patient.name} from your patient list?`)) {
                              handleDeletePatient(patient.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Patient Form Dialog */}
      <PatientForm
        open={showPatientForm}
        onOpenChange={setShowPatientForm}
        onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
        initialData={editingPatient}
        onClose={() => {
          setEditingPatient(null);
          setShowPatientForm(false);
        }}
      />

      {/* Medical History Dialog */}
      <MedicalHistory
        open={showMedicalHistory}
        onOpenChange={setShowMedicalHistory}
        patient={selectedPatient}
        onClose={() => {
          setSelectedPatient(null);
          setShowMedicalHistory(false);
        }}
      />

      {/* Video Call Dialog */}
      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        doctorName="You"
        patientName={selectedPatient?.name || "Patient"}
      />

      {/* Audio Call Dialog */}
      <AudioCall
        isOpen={showAudioCall}
        onClose={() => setShowAudioCall(false)}
        doctorName="You"
        patientName={selectedPatient?.name || "Patient"}
      />

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat with {selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              Secure messaging with your patient
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <ChatComponent
              roomId={`doctor-patient-${selectedPatient.id}`}
              currentUserId="doctor-current"
              currentUserName="You"
              currentUserRole="doctor"
              otherUserName={selectedPatient.name}
              otherUserRole="patient"
              onClose={() => setShowChat(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Requests Dialog */}
      <DoctorRequestsDialog
        isOpen={showRequestsDialog}
        onClose={() => setShowRequestsDialog(false)}
        doctorId={localStorage.getItem("userEmail") || ""}
        onAcceptCommunication={handleAcceptCommunication}
        onAcceptPatient={handleAcceptPatient}
      />
    </div>
  );
};

export default DoctorManagement;
