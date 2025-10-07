import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Globe, Video, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface DoctorCardProps {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  languages: string[];
  location: string;
  availability: string;
  isOnline: boolean;
  doctorId?: number; // Add doctor ID for call requests
}

const DoctorCard = ({
  name,
  specialty,
  experience,
  rating,
  languages,
  location,
  availability,
  isOnline,
  doctorId,
}: DoctorCardProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleCallRequest = async (callType: 'video' | 'audio' | 'text') => {
    if (!doctorId || !token) return;

    setIsRequesting(true);
    try {
      const response = await fetch('http://localhost:5000/notification/call-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          call_type: callType,
          message: `Requesting ${callType} consultation`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Request Sent",
          description: `Your ${callType} call request has been sent to Dr. ${name}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className="doctor-card">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-lg">
                {name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-success rounded-full border-2 border-background pulse-glow" />
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                Dr. {name}
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  {rating}
                </div>
              </div>
              
              <div className="text-sm text-primary font-medium">
                {specialty}
              </div>
              
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {experience} experience
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>
                
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {languages.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium text-foreground">
                  {availability}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isOnline 
                    ? "bg-success/10 text-success border border-success/20" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Call Request Buttons */}
            {doctorId && (
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCallRequest('video')}
                  disabled={isRequesting}
                  className="flex-1"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCallRequest('audio')}
                  disabled={isRequesting}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Audio
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCallRequest('text')}
                  disabled={isRequesting}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Text
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;