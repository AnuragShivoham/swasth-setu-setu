import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";

interface AudioCallProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  patientName: string;
  doctorAvatar?: string;
  patientAvatar?: string;
  roomId?: string;
}

const AudioCall = ({
  isOpen,
  onClose,
  doctorName,
  patientName,
  doctorAvatar,
  patientAvatar,
  roomId
}: AudioCallProps) => {
  const { toast } = useToast();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    } else {
      endCall();
    }

    return () => {
      endCall();
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStartTime && isConnected) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStartTime, isConnected]);

  const initializeCall = async () => {
    try {
      // Get audio only
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      localStreamRef.current = stream;

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current!.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          setIsRinging(false);
          setCallStartTime(new Date());
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real app, send candidate to signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Create offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      // In a real app, send offer to signaling server
      console.log('Audio offer created:', offer);

      toast({
        title: "Audio Call Started",
        description: "Connecting to the other participant...",
      });

    } catch (error) {
      console.error('Error initializing audio call:', error);
      toast({
        title: "Call Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
      onClose();
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Reset state
    setIsConnected(false);
    setCallStartTime(null);
    setCallDuration(0);
    setIsAudioEnabled(true);
    setIsMuted(false);
    setIsRinging(false);
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

  const toggleMute = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsMuted(remoteAudioRef.current.muted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
    onClose();
    toast({
      title: "Call Ended",
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="text-center">
          <DialogTitle>Audio Call</DialogTitle>
          <DialogDescription>
            {doctorName} ↔ {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-8">
          {/* Caller Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                {doctorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isConnected && (
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-success rounded-full border-4 border-background pulse-glow" />
            )}
          </div>

          {/* Call Status */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{doctorName}</h3>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isRinging ? "Ringing..." : isConnected ? "Connected" : "Connecting..."}
              </Badge>
              {isConnected && (
                <Badge variant="outline">
                  {formatDuration(callDuration)}
                </Badge>
              )}
            </div>
          </div>

          {/* Audio Visualization */}
          {isConnected && (
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Hidden audio element for remote audio */}
          <audio ref={remoteAudioRef} autoPlay />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioEnabled ? "outline" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-14 h-14 p-0"
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {isConnected && (
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-14 h-14 p-0"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          )}

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-16 h-16 p-0"
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {!isAudioEnabled && "Microphone is muted"}
          {isMuted && " • Speaker is muted"}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioCall;
