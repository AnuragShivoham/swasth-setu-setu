import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, User, MessageSquare } from "lucide-react";

interface ConsultationBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationType: "video" | "audio" | "async";
  specialty?: string;
  context: "human" | "pet";
  doctorName?: string;
}

const ConsultationBookingDialog = ({
  open,
  onOpenChange,
  consultationType,
  specialty,
  context,
  doctorName,
}: ConsultationBookingDialogProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [loading, setLoading] = useState(false);

  const handleBookConsultation = async () => {
    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select both date and time for your consultation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const appointment = {
        id: Date.now().toString(),
        type: consultationType,
        context,
        specialty: specialty || "General",
        doctorName: doctorName || "Auto-assigned",
        date,
        time,
        symptoms,
        urgency,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      existingAppointments.push(appointment);
      localStorage.setItem('appointments', JSON.stringify(existingAppointments));

      toast({
        title: "Consultation booked!",
        description: `${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)} consultation scheduled for ${date} at ${time}`,
      });

      // Reset form
      setDate("");
      setTime("");
      setSymptoms("");
      setUrgency("normal");
      setLoading(false);
      onOpenChange(false);
    }, 1500);
  };

  const getConsultationIcon = () => {
    switch (consultationType) {
      case "video":
        return <User className="h-5 w-5" />;
      case "audio":
        return <MessageSquare className="h-5 w-5" />;
      case "async":
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getConsultationTitle = () => {
    const typeMap = {
      video: "Video Consultation",
      audio: "Audio Consultation",
      async: "Message Consultation",
    };
    return typeMap[consultationType];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getConsultationIcon()}
            Book {getConsultationTitle()}
          </DialogTitle>
          <DialogDescription>
            {context === "human"
              ? "Schedule your medical consultation with a healthcare professional."
              : "Schedule your veterinary consultation for your pet's health."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {doctorName && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Assigned Doctor</div>
              <div className="text-sm text-muted-foreground">Dr. {doctorName}</div>
            </div>
          )}

          {specialty && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Specialty</div>
              <div className="text-sm text-muted-foreground">{specialty}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Routine checkup</SelectItem>
                <SelectItem value="normal">Normal - General consultation</SelectItem>
                <SelectItem value="high">High - Urgent care needed</SelectItem>
                <SelectItem value="emergency">Emergency - Immediate attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="symptoms">
              Symptoms or Reason for Consultation
              {consultationType === "async" && " (Optional)"}
            </Label>
            <Textarea
              id="symptoms"
              placeholder={
                context === "human"
                  ? "Describe your symptoms, concerns, or reason for consultation..."
                  : "Describe your pet's symptoms, behavior changes, or concerns..."
              }
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBookConsultation} disabled={loading}>
            {loading ? "Booking..." : "Book Consultation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationBookingDialog;
