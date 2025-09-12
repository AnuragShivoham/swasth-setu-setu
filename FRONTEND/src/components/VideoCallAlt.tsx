import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff,
  Settings,
  MessageSquare,
  Monitor,
  Clock
} from "lucide-react";

interface VideoCallAltProps {
  consultationType: "human" | "pet";
  doctorName: string;
  specialty: string;
  onEndCall: () => void;
}

const VideoCallAlt = ({ consultationType, doctorName, specialty, onEndCall }: VideoCallAltProps) => {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionStatus("connected");
      setIsCallActive(true);
      toast({
        title: "Call Connected",
        description: `Connected with Dr. ${doctorName}`,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [doctorName, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Media devices not supported");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        toast({
          title: "Camera & Microphone",
          description: "Access granted successfully",
        });

      } catch (error: any) {
        let errorMessage = "Unable to access camera/microphone";
        let errorDescription = "Please check your browser settings and try again";

        if (error.name === "NotAllowedError") {
          errorMessage = "Permission Denied";
          errorDescription = "Please allow camera and microphone access in your browser";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No Camera/Microphone Found";
          errorDescription = "Please connect a camera and microphone";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Not Supported";
          errorDescription = "Your browser doesn't support camera/microphone access";
        } else if (error.name === "NotSecureError") {
          errorMessage = "Not Secure";
          errorDescription = "Camera access requires HTTPS. Please use a secure connection";
        }

        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive"
        });
      }
    };

    const timer = setTimeout(() => {
      initializeMedia();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing",
          description: "Screen sharing started",
        });
      } else {
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing",
          description: "Screen sharing stopped",
        });
      }
    } catch (error) {
      console.error("Error with screen sharing:", error);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    setConnectionStatus("disconnected");
    toast({
      title: "Call Ended",
      description: `Call duration: ${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, '0')}`,
    });
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (connectionStatus === "connecting") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 z-50 flex items-center justify-center italic font-serif">
        <Card className="w-full max-w-md border-2 border-pink-400 shadow-lg">
          <CardHeader className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-pink-200 flex items-center justify-center">
              <Video className="h-8 w-8 text-pink-600 animate-pulse" />
            </div>
            <CardTitle className="italic font-normal text-pink-700">Connecting to Dr. {doctorName}</CardTitle>
            <p className="text-sm text-pink-600 italic">{specialty}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4 italic font-normal text-pink-700">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 bg-pink-600 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="h-2 w-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p>
              {consultationType === "human" ? "Preparing secure medical consultation..." : "Preparing veterinary consultation..."}
            </p>
            <Button variant="outline" onClick={onEndCall} className="italic font-normal border-pink-600 text-pink-600 hover:bg-pink-100">
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 z-50 flex flex-col italic font-serif">
      {/* Header */}
      <div className="bg-pink-50 border-b border-pink-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-pink-200 flex items-center justify-center">
            <span className="text-pink-600 font-semibold italic">
              {doctorName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-semibold italic text-pink-700">Dr. {doctorName}</h3>
            <p className="text-sm text-pink-600 italic">{specialty}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-pink-600 italic">
            <div className="h-2 w-2 bg-pink-600 rounded-full" />
            <Clock className="h-4 w-4" />
            {formatDuration(callDuration)}
          </div>
          <div className="flex items-center gap-1 text-xs text-pink-600 italic">
            <div className="h-2 w-2 bg-pink-600 rounded-full animate-pulse" />
            Connected
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-pink-50/70">
        {/* Remote Video (Doctor) */}
        <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Placeholder for remote video */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-24 w-24 mx-auto rounded-full bg-pink-200 flex items-center justify-center">
                <span className="text-pink-600 font-bold text-2xl italic">
                  {doctorName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg italic text-pink-700">Dr. {doctorName}</p>
                <p className="text-pink-600 italic">{specialty}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Video (User) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-pink-50 rounded-lg border-2 border-pink-300 overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-pink-100 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-pink-600" />
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-full bg-pink-50 border-l border-pink-300 flex flex-col italic font-normal">
            <div className="p-4 border-b border-pink-300">
              <h3 className="font-semibold italic text-pink-700">Chat</h3>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div className="bg-pink-100 rounded-lg p-3 italic font-normal text-pink-700">
                <p className="text-sm">Hello! I'm Dr. {doctorName}. How can I help you today?</p>
              </div>
            </div>
            <div className="p-4 border-t border-pink-300">
              <div className="flex gap-2">
                <input 
                  className="flex-1 px-3 py-2 border rounded-lg text-sm italic font-normal text-pink-700" 
                  placeholder="Type a message..."
                />
                <Button size="sm" className="italic font-normal text-pink-700">Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-pink-50 border-t border-pink-300 p-4 italic font-normal">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-12 w-12"
          >
            {isVideoEnabled ? <Video className="h-5 w-5 text-pink-600" /> : <VideoOff className="h-5 w-5 text-pink-600" />}
          </Button>

          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-12 w-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5 text-pink-600" /> : <MicOff className="h-5 w-5 text-pink-600" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full h-12 w-12"
          >
            <PhoneOff className="h-5 w-5 text-pink-600" />
          </Button>

          <Button
            variant={isScreenSharing ? "hero" : "secondary"}
            size="lg"
            onClick={handleScreenShare}
            className="rounded-full h-12 w-12"
          >
            <Monitor className="h-5 w-5 text-pink-600" />
          </Button>

          <Button
            variant={showChat ? "hero" : "secondary"}
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full h-12 w-12"
          >
            <MessageSquare className="h-5 w-5 text-pink-600" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full h-12 w-12"
          >
            <Settings className="h-5 w-5 text-pink-600" />
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-pink-600 italic font-normal">
            {consultationType === "human" 
              ? "Secure end-to-end encrypted medical consultation" 
              : "Professional veterinary consultation for your pet"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCallAlt;
