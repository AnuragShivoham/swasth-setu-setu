import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  MonitorOff,
  MessageSquare,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoCallProps {
  doctorName?: string;
  specialty?: string;
  onEndCall: () => void;
  callType?: "video" | "audio";
}

interface ChatMessage {
  sender: "user" | "doctor";
  message: string;
  timestamp: Date;
}

const VideoCall = ({ 
  doctorName = "Dr. Priya Sharma", 
  specialty = "General Medicine",
  onEndCall,
  callType = "video"
}: VideoCallProps) => {
  const { toast } = useToast();
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeCall();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      const constraints = {
        video: callType === "video" ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection
      setTimeout(() => {
        setConnectionStatus("connected");
        toast({
          title: "Call Connected",
          description: `Connected with ${doctorName}`,
        });
      }, 2000);

    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Camera/Microphone Error",
        description: "Please allow access to camera and microphone",
        variant: "destructive",
      });
      setConnectionStatus("disconnected");
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        toast({
          title: videoTrack.enabled ? "Camera On" : "Camera Off",
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        toast({
          title: audioTrack.enabled ? "Microphone On" : "Microphone Off",
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
        });

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast({
          title: "Screen Share Error",
          description: "Could not start screen sharing",
          variant: "destructive",
        });
      }
    } else {
      setIsScreenSharing(false);
      toast({
        title: "Screen Sharing Stopped",
      });
    }
  };

  const handleEndCall = () => {
    cleanup();
    toast({
      title: "Call Ended",
      description: "Thank you for using SwasthSetu",
    });
    onEndCall();
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        { sender: "user", message: chatMessage, timestamp: new Date() }
      ]);
      setChatMessage("");

      // Simulate doctor response
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { 
            sender: "doctor", 
            message: "I understand. Let me help you with that.", 
            timestamp: new Date() 
          }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === "connected" ? "bg-success animate-pulse" :
              connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
              "bg-destructive"
            }`} />
            <div>
              <h2 className="font-semibold text-lg">{doctorName}</h2>
              <p className="text-sm text-muted-foreground">{specialty}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {connectionStatus === "connected" ? "Connected" :
             connectionStatus === "connecting" ? "Connecting..." :
             "Disconnected"}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-muted/30">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Remote Video (Doctor) */}
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {connectionStatus === "connecting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p className="text-muted-foreground">Connecting to doctor...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Self View) */}
          {callType === "video" && (
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-background rounded-lg overflow-hidden border-2 border-border shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Chat Sidebar */}
          {showChat && (
            <Card className="absolute right-4 top-4 bottom-20 w-80 flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Chat</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-2 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Type a message..."
                />
                <Button onClick={sendChatMessage} size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto flex items-center justify-center gap-3">
          {callType === "video" && (
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoOn ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>
          )}

          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioOn ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {callType === "video" && (
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14"
            >
              {isScreenSharing ? (
                <MonitorOff className="h-6 w-6" />
              ) : (
                <Monitor className="h-6 w-6" />
              )}
            </Button>
          )}

          <Button
            variant={showChat ? "default" : "outline"}
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full w-14 h-14"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
