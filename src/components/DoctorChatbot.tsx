import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Stethoscope } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const DoctorChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI health assistant. I can help you with basic health queries, symptom assessment, and guide you to the right healthcare services. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("fever") || input.includes("temperature")) {
      return "For fever symptoms, I recommend:\n\n• Monitor your temperature regularly\n• Stay hydrated with plenty of fluids\n• Rest and avoid strenuous activities\n• Consider paracetamol if temperature is above 100°F\n\nIf fever persists for more than 3 days or exceeds 103°F, please consult a doctor immediately. Would you like me to help you book a consultation?";
    }
    
    if (input.includes("headache") || input.includes("head pain")) {
      return "For headache relief:\n\n• Ensure you're well hydrated\n• Try gentle head and neck massage\n• Rest in a quiet, dark room\n• Apply cold or warm compress\n• Avoid screen time\n\nIf headaches are severe, frequent, or accompanied by other symptoms like vision changes, please consult a healthcare provider. Shall I connect you with a neurologist?";
    }
    
    if (input.includes("cough") || input.includes("cold")) {
      return "For cough and cold symptoms:\n\n• Drink warm liquids like herbal tea\n• Gargle with warm salt water\n• Use a humidifier or inhale steam\n• Get adequate rest\n• Avoid cold foods and drinks\n\nIf symptoms persist beyond a week or worsen, consider consulting a doctor. Would you like to schedule a consultation with a general physician?";
    }

    if (input.includes("pet") || input.includes("dog") || input.includes("cat")) {
      return "For pet health concerns:\n\n• Monitor your pet's eating and drinking habits\n• Check for any unusual behavior or symptoms\n• Ensure regular exercise and grooming\n• Keep vaccination schedule up to date\n\nOur veterinary experts are available for pet consultations. Would you like me to connect you with a veterinarian?";
    }

    if (input.includes("appointment") || input.includes("book") || input.includes("doctor")) {
      return "I can help you book an appointment! Here are your options:\n\n• Video Consultation - Face-to-face with doctor\n• Audio Consultation - Voice-only call\n• Async Messaging - Send symptoms, get advice\n\nWe have 5000+ verified doctors available across specialties. Which type of consultation would you prefer?";
    }

    if (input.includes("emergency") || input.includes("urgent")) {
      return "⚠️ For medical emergencies:\n\n• Call 108 (Emergency Services)\n• Call 102 (Medical Emergency)\n• Visit nearest hospital immediately\n\nIf this is not a life-threatening emergency but needs urgent attention, I can help you connect with an available doctor right now. Please describe your symptoms.";
    }

    // Default response
    return "I understand you're asking about: \"" + userInput + "\"\n\nI'm here to help with health-related queries. I can assist with:\n\n• Basic symptom assessment\n• Health advice and tips\n• Booking doctor consultations\n• Finding the right specialist\n• Pet health guidance\n\nCould you please provide more specific details about your health concern so I can give you better guidance?";
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              AI Health Assistant
              <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">Online</span>
            </CardTitle>
            <CardDescription>
              Get instant health guidance and connect with healthcare professionals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-96 w-full border rounded-lg p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={
                    message.sender === "user" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-secondary/10 text-secondary"
                  }>
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Stethoscope className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-secondary/10 text-secondary">
                    <Stethoscope className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Ask about symptoms, health concerns, or book appointments..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isTyping}
            variant="hero"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInputMessage("I have a fever")}
          >
            Fever symptoms
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInputMessage("I need to book an appointment")}
          >
            Book appointment
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInputMessage("My pet is not eating")}
          >
            Pet health
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInputMessage("This is an emergency")}
          >
            Emergency help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorChatbot;