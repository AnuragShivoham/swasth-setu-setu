import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Video, Phone, MessageSquare, Clock, User } from "lucide-react";

interface CallRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  doctorSpecialty: string;
  requestType: "video" | "audio" | "chat";
  onRequestSent: (reason: string) => void;
}

const CallRequestDialog = ({
  isOpen,
  onClose,
  doctorName,
  doctorSpecialty,
  requestType,
  onRequestSent
}: CallRequestDialogProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRequestTypeInfo = () => {
    switch (requestType) {
      case "video":
        return {
          icon: <Video className="h-5 w-5" />,
          title: "Video Call Request",
          description: "Request a video consultation with the doctor",
          color: "text-blue-600"
        };
      case "audio":
        return {
          icon: <Phone className="h-5 w-5" />,
          title: "Audio Call Request",
          description: "Request an audio consultation with the doctor",
          color: "text-green-600"
        };
      case "chat":
        return {
          icon: <MessageSquare className="h-5 w-5" />,
          title: "Chat Request",
          description: "Start a text conversation with the doctor",
          color: "text-purple-600"
        };
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for your consultation request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to send request
      await new Promise(resolve => setTimeout(resolve, 1000));

      onRequestSent(reason);

      toast({
        title: "Request sent successfully",
        description: `Your ${requestType} consultation request has been sent to Dr. ${doctorName}. You will be notified when they respond.`,
      });

      onClose();
      setReason("");
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Failed to send consultation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestInfo = getRequestTypeInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-muted ${requestInfo.color}`}>
              {requestInfo.icon}
            </div>
            <div>
              <DialogTitle>{requestInfo.title}</DialogTitle>
              <DialogDescription>{requestInfo.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Dr. {doctorName}</div>
              <div className="text-sm text-muted-foreground">{doctorSpecialty}</div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Usually responds in 5-10 min
            </Badge>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason for consultation *
            </label>
            <Textarea
              placeholder={`Describe why you need a ${requestType} consultation with Dr. ${doctorName}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about your symptoms or concerns to help the doctor prepare for the consultation.
            </p>
          </div>

          {/* Request Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Your request will be sent immediately to the doctor</p>
            <p>• You will receive a notification when the doctor accepts</p>
            <p>• Consultation will start automatically once accepted</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1"
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallRequestDialog;
