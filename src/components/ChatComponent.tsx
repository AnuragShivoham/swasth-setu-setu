import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Paperclip, Image as ImageIcon, FileText } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: "doctor" | "patient";
  timestamp: string;
  message_type: "text" | "image" | "file";
  file_url?: string;
  file_name?: string;
}

interface ChatComponentProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "doctor" | "patient";
  otherUserName: string;
  otherUserRole: "doctor" | "patient";
  onClose?: () => void;
}

const ChatComponent = ({
  roomId,
  currentUserId,
  currentUserName,
  currentUserRole,
  otherUserName,
  otherUserRole,
  onClose
}: ChatComponentProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
    checkOnlineStatus();

    return () => {
      supabase.removeAllChannels();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("timestamp", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          );
        }
      )
      .subscribe();
  };

  const checkOnlineStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("is_online, last_seen")
        .eq("name", otherUserName)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const lastSeen = new Date(data.last_seen);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

        setIsOnline(data.is_online && diffMinutes < 5);
      }
    } catch (error) {
      console.error("Error checking online status:", error);
    }
  };

  const sendMessage = async (content: string, type: "text" | "image" | "file" = "text", fileData?: { url: string; name: string }) => {
    if (!content.trim() && type === "text") return;

    try {
      const messageData = {
        room_id: roomId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: currentUserRole,
        content: type === "text" ? content : fileData?.name || content,
        message_type: type,
        file_url: fileData?.url,
        file_name: fileData?.name,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("chat_messages")
        .insert(messageData);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${roomId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath);

      const messageType = file.type.startsWith("image/") ? "image" : "file";

      await sendMessage(file.name, messageType, {
        url: data.publicUrl,
        name: file.name
      });

      toast({
        title: "File Sent",
        description: `${file.name} has been sent`,
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender_id === currentUserId;

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {message.sender_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
          {!isOwnMessage && (
            <div className="text-xs text-muted-foreground mb-1">
              {message.sender_name}
            </div>
          )}

          <div
            className={`rounded-lg px-3 py-2 ${
              isOwnMessage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.message_type === "image" && message.file_url && (
              <div className="space-y-2">
                <img
                  src={message.file_url}
                  alt={message.file_name}
                  className="rounded max-w-full h-auto"
                  style={{ maxHeight: '200px' }}
                />
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            {message.message_type === "file" && message.file_url && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:no-underline"
                >
                  {message.content}
                </a>
              </div>
            )}

            {message.message_type === "text" && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>

          <div className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>

        {isOwnMessage && (
          <Avatar className="h-8 w-8 order-2">
            <AvatarFallback className="text-xs">
              {currentUserName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat with {otherUserName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Send images, documents, or text messages
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatComponent;
