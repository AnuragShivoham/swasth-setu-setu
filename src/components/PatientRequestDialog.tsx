import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { User, FileText, Upload, X } from "lucide-react";

interface PatientRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  doctorSpecialty: string;
  onRequestSent: (requestData: any) => void;
}

const PatientRequestDialog = ({
  isOpen,
  onClose,
  doctorName,
  doctorSpecialty,
  onRequestSent
}: PatientRequestDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    urgency: "normal",
    symptoms: "",
    medicalHistory: ""
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (documents.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload maximum 5 documents.",
        variant: "destructive",
      });
      return;
    }
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.reason) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const requestData = {
        ...formData,
        doctorName,
        doctorSpecialty,
        documents: documents.map(doc => ({
          name: doc.name,
          size: doc.size,
          type: doc.type
        })),
        submittedAt: new Date().toISOString(),
        status: "pending"
      };

      onRequestSent(requestData);

      toast({
        title: "Request sent successfully",
        description: `Your patient request has been sent to Dr. ${doctorName}. They will review and respond to your request.`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        reason: "",
        urgency: "normal",
        symptoms: "",
        medicalHistory: ""
      });
      setDocuments([]);

      onClose();
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Failed to send patient request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Request to Add as Patient</DialogTitle>
              <DialogDescription>
                Send a request to Dr. {doctorName} to become their patient
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {doctorName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="font-medium">Dr. {doctorName}</div>
              <div className="text-sm text-muted-foreground">{doctorSpecialty}</div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Routine care</SelectItem>
                    <SelectItem value="normal">Normal - General consultation</SelectItem>
                    <SelectItem value="high">High - Urgent care needed</SelectItem>
                    <SelectItem value="emergency">Emergency - Immediate attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Medical Information</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                  id="reason"
                  placeholder="Why do you want to become a patient of Dr. {doctorName}?"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Current Symptoms (Optional)</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe any current symptoms or health concerns..."
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange("symptoms", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="history">Medical History (Optional)</Label>
                <Textarea
                  id="history"
                  placeholder="Brief medical history, past conditions, medications, allergies..."
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h4 className="font-medium">Supporting Documents (Optional)</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                />
                <Label
                  htmlFor="document-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </Label>
                <span className="text-sm text-muted-foreground">
                  PDF, DOC, Images (Max 5 files)
                </span>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(doc.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-1 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900">What happens next?</p>
            <p>• Dr. {doctorName} will review your request within 24 hours</p>
            <p>• You will receive an email notification with their decision</p>
            <p>• If accepted, you can schedule your first consultation</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Sending Request..." : "Send Patient Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientRequestDialog;
