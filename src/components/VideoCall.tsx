import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, MonitorOff } from "lucide-react";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  patientName: string;
  roomId?: string;
}

const VideoCall = ({ isOpen, onClose, doctorName, patientName, roomId }: VideoCallProps) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

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
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

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
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
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
      console.log('Offer created:', offer);

      toast({
        title: "Call Started",
        description: "Connecting to the other participant...",
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: "Call Error",
        description: "Failed to access camera/microphone. Please check permissions.",
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
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);
  };

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

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        const videoTrack = stream.getVideoTracks()[0];

        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        localStreamRef.current = stream;
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        const screenTrack = stream.getVideoTracks()[0];

        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setIsScreenSharing(true);

        // Handle screen share end
        screenTrack.onended = () => {
          toggleScreenShare();
        };
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Screen Share Error",
        description: "Failed to start screen sharing",
        variant: "destructive",
      });
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
      <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div>
              Video Call: {doctorName} ↔ {patientName}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Connecting..."}
              </Badge>
              {isConnected && (
                <Badge variant="outline">
                  {formatDuration(callDuration)}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            High-quality video consultation with real-time communication
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 p-6 pt-0">
          {/* Remote Video (Main) */}
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Connecting...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="w-80 relative bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs">
                You {!isVideoEnabled && "(Video Off)"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 pt-0">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoEnabled ? "outline" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14 p-0"
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            <Button
              variant={isAudioEnabled ? "outline" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14 p-0"
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14 p-0"
            >
              {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-16 h-16 p-0"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
          </div>

          <div className="text-center mt-4 text-sm text-muted-foreground">
            {isScreenSharing && "Screen sharing is active"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCall;
