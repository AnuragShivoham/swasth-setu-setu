import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Globe } from "lucide-react";

interface Doctor {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  languages: string[];
  location: string;
  availability: string;
  isOnline: boolean;
}

interface DoctorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialty?: string;
  context: "human" | "pet";
  onDoctorSelect: (doctor: Doctor) => void;
}

const DoctorSelectionDialog = ({
  open,
  onOpenChange,
  specialty,
  context,
  onDoctorSelect,
}: DoctorSelectionDialogProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Mock doctors data - in real app this would come from API
  const doctors: Doctor[] = context === "human" ? [
    {
      name: "Priya Sharma",
      specialty: "General Medicine",
      experience: "8+ years",
      rating: 4.8,
      languages: ["Hindi", "English"],
      location: "Delhi",
      availability: "Available now",
      isOnline: true
    },
    {
      name: "Rajesh Kumar",
      specialty: "Cardiology",
      experience: "12+ years",
      rating: 4.9,
      languages: ["Hindi", "English", "Punjabi"],
      location: "Mumbai",
      availability: "Next: 15 min",
      isOnline: false
    },
    {
      name: "Meera Patel",
      specialty: "Dermatology",
      experience: "6+ years",
      rating: 4.7,
      languages: ["Hindi", "English", "Gujarati"],
      location: "Ahmedabad",
      availability: "Available now",
      isOnline: true
    },
    {
      name: "Amit Singh",
      specialty: "Pediatrics",
      experience: "10+ years",
      rating: 4.9,
      languages: ["Hindi", "English", "Punjabi"],
      location: "Chandigarh",
      availability: "Available now",
      isOnline: true
    },
    {
      name: "Kavita Rao",
      specialty: "Gynecology",
      experience: "15+ years",
      rating: 4.8,
      languages: ["Hindi", "English", "Kannada"],
      location: "Bangalore",
      availability: "Next: 30 min",
      isOnline: false
    }
  ] : [
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
    },
    {
      name: "Vikram Joshi",
      specialty: "Emergency Care",
      experience: "12+ years",
      rating: 4.9,
      languages: ["Hindi", "English", "Marathi"],
      location: "Pune",
      availability: "Available now",
      isOnline: true
    }
  ];

  const filteredDoctors = specialty
    ? doctors.filter(doctor => doctor.specialty === specialty)
    : doctors;

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    onDoctorSelect(doctor);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {specialty ? `${specialty} Specialists` : "Select a Doctor"}
          </DialogTitle>
          <DialogDescription>
            Choose from our verified {context === "human" ? "medical" : "veterinary"} professionals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleSelectDoctor(doctor)}
            >
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-lg">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {doctor.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-success rounded-full border-2 border-background pulse-glow" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Dr. {doctor.name}</h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        {doctor.rating}
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                  </div>
                  <Badge variant={doctor.isOnline ? "default" : "secondary"}>
                    {doctor.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {doctor.experience} experience
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {doctor.languages.join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {doctor.availability}
                  </span>
                  <Button size="sm" variant="outline">
                    Select Doctor
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorSelectionDialog;
