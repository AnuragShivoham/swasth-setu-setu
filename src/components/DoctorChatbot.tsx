import { useState, useEffect } from "react";
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

type DoctorChatbotProps = { initialMessage?: string };

const DoctorChatbot = ({ initialMessage }: DoctorChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI health assistant. I can help you with basic health queries, symptom assessment, and guide you to the right healthcare services. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSendMessage = () => sendMessage(inputMessage);


  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Enhanced symptom analysis with more comprehensive medical knowledge
    if (input.includes("fever") || input.includes("temperature")) {
      return "🔴 **Fever Assessment**\n\n**Immediate Actions:**\n• Take temperature every 4-6 hours\n• Stay hydrated (2-3 liters water/day)\n• Rest in cool, comfortable environment\n• Wear light clothing\n\n**Medication (if needed):**\n• Paracetamol 500mg every 6 hours (max 4g/day)\n• Avoid aspirin in children under 16\n\n**Red Flags - Seek Immediate Care:**\n• Temperature >103°F (39.4°C)\n• Fever lasting >3 days\n• Severe headache, confusion, or neck stiffness\n• Difficulty breathing or chest pain\n• Rash or purple spots\n\n**Recommended:** Book video consultation with General Physician. Would you like me to help you schedule this now?";
    }

    if (input.includes("headache") || input.includes("head pain")) {
      return "🧠 **Headache Analysis**\n\n**Common Causes:**\n• Tension headache (most common)\n• Migraine (throbbing, one-sided)\n• Cluster headache (severe, behind eye)\n• Dehydration or stress\n\n**Management:**\n• Hydrate well (drink water)\n• Rest in dark, quiet room\n• Apply cold/hot compress\n• Gentle neck/shoulder massage\n• Avoid triggers (caffeine, alcohol)\n\n**When to Worry:**\n• Sudden, severe headache ('worst ever')\n• Headache with fever, nausea, vomiting\n• Vision changes, weakness, or confusion\n• Headache after head injury\n• New headache in patients >50 years\n\n**Specialist Referral:** Neurology consultation recommended for chronic or severe headaches.";
    }

    if (input.includes("cough") || input.includes("cold")) {
      return "🤧 **Respiratory Assessment**\n\n**Cough Analysis:**\n• Dry cough: May indicate viral infection, allergies\n• Productive cough: Bacterial infection possible\n• Chronic cough: Could be asthma, GERD, or post-nasal drip\n\n**Management Protocol:**\n• Steam inhalation 3-4 times daily\n• Warm saltwater gargles\n• Honey + lemon tea (adults only)\n• Humidifier in bedroom\n• Avoid irritants (smoke, dust)\n\n**Antibiotic Guidelines:**\n• Usually not needed for viral infections\n• Consider if symptoms >7-10 days\n• Green/yellow sputum, fever >101°F\n\n**Monitoring:** Track symptoms daily. Seek care if shortness of breath, chest pain, or high fever.";
    }

    if (input.includes("chest pain") || input.includes("heart")) {
      return "❤️ **Cardiac Assessment - URGENT**\n\n**Immediate Evaluation Needed:**\n• Any chest pain requires prompt medical attention\n• Heart attack symptoms: Pressure, tightness, pain radiating to arm/jaw\n• Risk factors: Age >50, smoking, diabetes, hypertension\n\n**Emergency Signs:**\n• Severe chest pain lasting >5 minutes\n• Pain with shortness of breath\n• Sweating, nausea, lightheadedness\n• Irregular heartbeat\n\n**Action Required:** Call emergency services (102/108) immediately. Do not delay. While waiting, chew aspirin 325mg if no allergy. Would you like me to help locate nearest emergency facility?";
    }

    if (input.includes("abdominal") || input.includes("stomach") || input.includes("pain")) {
      return "🩺 **Abdominal Pain Assessment**\n\n**Location Matters:**\n• Upper right: Liver/gallbladder\n• Upper center: Stomach/esophagus\n• Lower right: Appendix\n• Lower left: Diverticulitis\n• Diffuse: Gastroenteritis\n\n**Associated Symptoms:**\n• Nausea/vomiting: Gastrointestinal infection\n• Fever: Infection or inflammation\n• Blood in stool: Urgent evaluation needed\n• Severe pain: Surgical emergency possible\n\n**Management:**\n• Clear liquids initially\n• Avoid solid food if vomiting\n• Rest, apply warm compress\n• OTC antacids for indigestion\n\n**When to Seek Care:** Severe pain, fever >101°F, vomiting blood, signs of dehydration.";
    }

    if (input.includes("diabetes") || input.includes("blood sugar")) {
      return "📊 **Diabetes Management**\n\n**Blood Sugar Targets:**\n• Fasting: 80-130 mg/dL\n• Post-meal (2h): <180 mg/dL\n• HbA1c: <7% (generally)\n\n**Monitoring:**\n• Check blood sugar regularly\n• Keep glucose diary\n• Monitor for hypo/hyperglycemia\n\n**Lifestyle:**\n• Balanced diet (low glycemic index)\n• Regular exercise (150 min/week)\n• Weight management\n• Stress reduction\n\n**Medication Adherence:** Take medications as prescribed. Never skip doses.\n\n**Emergency:** Seek immediate care for blood sugar <70 mg/dL or >300 mg/dL with symptoms.";
    }

    if (input.includes("hypertension") || input.includes("blood pressure")) {
      return "🩸 **Hypertension Management**\n\n**BP Classification:**\n• Normal: <120/80 mmHg\n• Elevated: 120-129/<80 mmHg\n• Stage 1: 130-139/80-89 mmHg\n• Stage 2: ≥140/≥90 mmHg\n• Crisis: >180/>120 mmHg\n\n**Management:**\n• DASH diet (fruits, vegetables, low sodium)\n• Regular exercise (150 min/week)\n• Weight loss if overweight\n• Limit alcohol (<2 drinks/day)\n• Stress management\n\n**Medication:** Usually lifelong. Don't stop without doctor consultation.\n\n**Monitoring:** Home BP monitoring recommended. Check BP regularly.";
    }

    if (input.includes("pet") || input.includes("dog") || input.includes("cat")) {
      return "🐾 **Veterinary Assessment**\n\n**Common Pet Issues:**\n• Vomiting/diarrhea: Dietary indiscretion, infection\n• Lethargy: Infection, pain, or metabolic disease\n• Limping: Trauma, arthritis, or infection\n• Skin problems: Allergies, parasites, infection\n\n**Emergency Signs:**\n• Difficulty breathing\n• Severe bleeding\n• Seizures or collapse\n• Inability to urinate\n• Toxic ingestion\n\n**Preventive Care:**\n• Regular vaccinations\n• Parasite prevention\n• Dental care\n• Annual wellness exams\n\n**Recommendation:** Schedule veterinary consultation. Our certified vets are available 24/7 for emergencies.";
    }

    if (input.includes("appointment") || input.includes("book") || input.includes("doctor")) {
      return "📅 **Consultation Booking**\n\n**Available Services:**\n• **Video Consultation:** Real-time visual examination\n• **Audio Consultation:** Voice-only assessment\n• **Chat Consultation:** Text-based medical advice\n• **Emergency:** 24/7 urgent care\n\n**Specialties Available:**\n• General Medicine\n• Cardiology\n• Dermatology\n• Pediatrics\n• Gynecology\n• Orthopedics\n• Psychiatry\n• And 15+ more specialties\n\n**Process:**\n1. Select preferred doctor/specialty\n2. Choose consultation type\n3. Book convenient time slot\n4. Receive confirmation & reminders\n\nWould you like me to help you find a specific specialist or book an appointment now?";
    }

    if (input.includes("emergency") || input.includes("urgent")) {
      return "🚨 **EMERGENCY PROTOCOL**\n\n**Life-Threatening Emergencies - Call Immediately:**\n• **102/108** - Emergency Medical Services\n• **Chest pain** - Possible heart attack\n• **Difficulty breathing** - Respiratory distress\n• **Severe bleeding** - Uncontrolled hemorrhage\n• **Stroke symptoms** - Sudden weakness, confusion\n• **Severe allergic reaction** - Anaphylaxis\n\n**While Waiting for Help:**\n• Stay calm, ensure safety\n• Provide clear location\n• Describe symptoms accurately\n• Follow dispatcher instructions\n\n**Non-Emergency but Urgent:**\n• High fever (>103°F) in children\n• Severe abdominal pain\n• Broken bones with deformity\n• Mental health crisis\n\n**Action:** I can help locate nearest emergency facility or connect you with on-call physician for immediate consultation.";
    }

    if (input.includes("mental health") || input.includes("anxiety") || input.includes("depression")) {
      return "🧠 **Mental Health Support**\n\n**Common Concerns:**\n• Anxiety disorders\n• Depression\n• Stress management\n• Sleep disorders\n• Relationship issues\n\n**Support Available:**\n• Psychiatrist consultation\n• Psychologist counseling\n• Therapy sessions\n• Medication management\n• Crisis intervention\n\n**Immediate Help:**\n• National Mental Health Helpline\n• Crisis counseling (available 24/7)\n• Emergency psychiatric care\n\n**Self-Care Tips:**\n• Regular exercise\n• Healthy sleep habits\n• Social connections\n• Mindfulness/meditation\n• Professional help when needed\n\n**Confidential:** All consultations are private and confidential. Would you like me to help you connect with a mental health specialist?";
    }

    // Enhanced default response with medical expertise
    return "🏥 **Medical Assessment**\n\nThank you for sharing your concern: \"" + userInput + "\"\n\nAs an AI health assistant trained on medical guidelines, I can provide:\n\n**🔍 Symptom Analysis**\n• Detailed assessment of your symptoms\n• Possible causes and differentials\n• Red flag identification\n\n**💊 Treatment Guidance**\n• Evidence-based recommendations\n• Medication information\n• Lifestyle modifications\n\n**👨‍⚕️ Specialist Referrals**\n• Appropriate specialty selection\n• Doctor matching based on expertise\n• Consultation booking assistance\n\n**🚨 Emergency Recognition**\n• Urgent condition identification\n• Emergency response guidance\n• Nearest facility location\n\n**📋 Health Monitoring**\n• Vital signs tracking\n• Symptom progression monitoring\n• Follow-up recommendations\n\nTo provide the most accurate guidance, please share:\n• Specific symptoms and duration\n• Associated symptoms\n• Medical history\n• Current medications\n• Recent test results\n\nHow can I assist you further with your health concern?";
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
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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