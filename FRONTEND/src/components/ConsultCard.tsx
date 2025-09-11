import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone, MessageSquare, Clock, Users } from "lucide-react";

interface ConsultCardProps {
  type: "video" | "audio" | "async";
  title: string;
  description: string;
  eta?: string;
  queuePosition?: number;
  totalQueue?: number;
  doctorName?: string;
  specialty?: string;
  onConsult: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}

const ConsultCard = ({
  type,
  title,
  description,
  eta,
  queuePosition,
  totalQueue,
  doctorName,
  specialty,
  onConsult,
  onCancel,
  onReschedule,
}: ConsultCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Phone className="h-5 w-5" />;
      case "async":
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case "video":
        return "hero";
      case "audio":
        return "consult";
      case "async":
        return "medical";
    }
  };

  return (
    <Card className="consultation-card hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary font-medium">
            {getIcon()}
            {title}
          </div>
          {specialty && (
            <span className="feature-highlight text-xs font-medium">
              {specialty}
            </span>
          )}
        </div>
        <CardDescription className="trust-text">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {eta && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            ETA: {eta}
          </div>
        )}
        
        {queuePosition && totalQueue && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Users className="h-4 w-4 text-primary" />
            <div className="text-sm">
              You're #{queuePosition} of {totalQueue} in queue
            </div>
          </div>
        )}

        {doctorName && (
          <div className="text-sm font-medium text-foreground">
            Dr. {doctorName}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant={getVariant()} className="flex-1" onClick={onConsult}>
            Start Consultation
          </Button>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onReschedule && (
            <Button variant="outline" size="sm" onClick={onReschedule}>
              Reschedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultCard;