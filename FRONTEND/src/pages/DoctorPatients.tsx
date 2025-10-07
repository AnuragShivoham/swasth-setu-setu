import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Video,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VideoCall from "@/components/VideoCall";
import { toast } from "@/components/ui/use-toast";
import Beams from "@/components/Beams";

const DoctorPatients = () => {
  const navigate = useNavigate();

  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ name: string; query: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePatient, setProfilePatient] = useState<any>(null);

  // Mock patient data
  const patients = [
    {
      id: 1,
      name: "Rahul Sharma",
      age: 35,
      query: "Persistent cough and fever",
      status: "Active",
      lastVisit: "2024-01-15",
      avatar: "RS"
    },
    {
      id: 2,
      name: "Priya Patel",
      age: 28,
      query: "Skin rash and itching",
      status: "Pending",
      lastVisit: "2024-01-10",
      avatar: "PP"
    },
    {
      id: 3,
      name: "Amit Kumar",
      age: 42,
      query: "Back pain and mobility issues",
      status: "Completed",
      lastVisit: "2024-01-08",
      avatar: "AK"
    },
    {
      id: 4,
      name: "Sneha Gupta",
      age: 31,
      query: "Headache and dizziness",
      status: "Active",
      lastVisit: "2024-01-12",
      avatar: "SG"
    }
  ];

  const handleStartVideoCall = (patient: { name: string; query: string }) => {
    setSelectedPatient(patient);
    setShowVideoCall(true);
  };

  const handleViewProfile = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setProfilePatient(patient);
      setShowProfile(true);
    }
  };

  return (
    <div className="min-h-screen bg-cream-white p-6 font-serif text-forest-green relative overflow-hidden">
      <div className="absolute inset-0 brightness-75 contrast-125 -z-10">
        <Beams beamWidth={3} beamHeight={20} beamNumber={15} lightColor="#228B22" speed={1.5} noiseIntensity={1.5} scale={0.3} rotation={15} />
      </div>
      <div className="max-w-6xl mx-auto space-y-6 relative z-10 bg-white/60 backdrop-blur-lg shadow-lg rounded-2xl p-8 mx-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/doctor')}
            className="border-forest-green text-forest-green hover:bg-forest-green hover:text-cream-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold italic text-forest-green">
              My Patients
            </h1>
            <p className="text-lg italic text-forest-green/80">
              Manage your patient consultations and queries
            </p>
          </div>
        </div>

        {/* Patients List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card key={patient.id} className="border-2 border-forest-green shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-forest-green text-cream-white">
                      {patient.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold italic text-forest-green">
                      {patient.name}
                    </CardTitle>
                    <CardDescription className="italic">
                      Age: {patient.age} • Last visit: {patient.lastVisit}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={patient.status === "Active" ? "default" : patient.status === "Pending" ? "secondary" : "outline"}
                  className="w-fit italic"
                >
                  {patient.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold italic text-forest-green mb-1">Query:</p>
                  <p className="text-sm italic text-forest-green/80">{patient.query}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewProfile(patient.id)}
                    className="bg-forest-green text-cream-white hover:bg-forest-green/90 italic"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartVideoCall({ name: patient.name, query: patient.query })}
                    className="border-forest-green text-forest-green hover:bg-forest-green hover:text-cream-white italic"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Video Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Call Modal */}
        {showVideoCall && selectedPatient && (
          <VideoCall
            consultationType="human"
            doctorName="Dr. Current Doctor"
            specialty="General Medicine"
            onEndCall={() => {
              setShowVideoCall(false);
              setSelectedPatient(null);
            }}
          />
        )}

        {/* Patient Profile Modal */}
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-lg border-2 border-forest-green">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold italic text-forest-green flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-forest-green text-cream-white">
                    {profilePatient?.avatar}
                  </AvatarFallback>
                </Avatar>
                {profilePatient?.name}
              </DialogTitle>
              <DialogDescription className="italic text-forest-green/80">
                Patient Profile Details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold italic text-forest-green">Age:</p>
                  <p className="text-sm italic text-forest-green/80">{profilePatient?.age} years</p>
                </div>
                <div>
                  <p className="font-semibold italic text-forest-green">Status:</p>
                  <Badge
                    variant={profilePatient?.status === "Active" ? "default" : profilePatient?.status === "Pending" ? "secondary" : "outline"}
                    className="w-fit italic"
                  >
                    {profilePatient?.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="font-semibold italic text-forest-green">Last Visit:</p>
                <p className="text-sm italic text-forest-green/80">{profilePatient?.lastVisit}</p>
              </div>
              <div>
                <p className="font-semibold italic text-forest-green">Current Query:</p>
                <p className="text-sm italic text-forest-green/80">{profilePatient?.query}</p>
              </div>
              <div>
                <p className="font-semibold italic text-forest-green">Medical History:</p>
                <p className="text-sm italic text-forest-green/80">No significant medical history recorded.</p>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowProfile(false)}
                className="border-forest-green text-forest-green hover:bg-forest-green hover:text-cream-white italic"
              >
                Close
              </Button>
              <Button
                onClick={() => handleStartVideoCall({ name: profilePatient?.name, query: profilePatient?.query })}
                className="bg-forest-green text-cream-white hover:bg-forest-green/90 italic"
              >
                <Video className="h-4 w-4 mr-1" />
                Start Video Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DoctorPatients;
