import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Stethoscope, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/integrations/supabase/types";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Login failed");
      }

      // Step 2: Fetch user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const profile = profileData as Profile;

      // Step 3: Verify role matches (optional but recommended)
      if (role && profile.role !== role) {
        toast({
          title: "Role mismatch",
          description: `This account is registered as a ${profile.role}. Please select the correct role.`,
          variant: "destructive",
        });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Step 4: Store user info in localStorage for quick access
      localStorage.setItem("userRole", profile.role);
      localStorage.setItem("userEmail", profile.email);
      localStorage.setItem("userId", profile.id);

      toast({
        title: "Login successful",
        description: profile.role === "doctor" ? "Welcome back, Doctor!" : "Welcome back!",
      });

      // Navigate based on role
      if (profile.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Invalid email or password. Please try again.";

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before logging in.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Fallback to localStorage demo users if Supabase fails
      const demoUsers = JSON.parse(localStorage.getItem("demo_users") || "[]");
      const demoUser = demoUsers.find((u: any) => u.email === email && u.role === role);

      if (demoUser) {
        // Use demo user as fallback
        localStorage.setItem("userRole", demoUser.role);
        localStorage.setItem("userEmail", demoUser.email);
        localStorage.setItem("userId", demoUser.id);

        toast({
          title: "Login successful",
          description: demoUser.role === "doctor" ? "Welcome back, Doctor!" : "Welcome back!",
        });

        if (demoUser.role === "doctor") {
          navigate("/doctor");
        } else {
          navigate("/home");
        }
        setLoading(false);
        return;
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole: "doctor" | "patient") => {
    // For demo purposes, create mock accounts in localStorage
    const demoEmail = demoRole === "doctor" ? "doctor@swasthsetu.com" : "patient@swasthsetu.com";
    const demoPassword = demoRole === "doctor" ? "doctor123" : "patient123";

    // Store demo user in localStorage (fallback until Supabase is set up)
    const demoUser = {
      id: demoRole === "doctor" ? "demo-doctor-id" : "demo-patient-id",
      email: demoEmail,
      role: demoRole,
      full_name: demoRole === "doctor" ? "Dr. Demo Doctor" : "Demo Patient",
      phone: "9876543210"
    };

    const existingUsers = JSON.parse(localStorage.getItem("demo_users") || "[]");
    const userExists = existingUsers.find((u: any) => u.email === demoEmail);

    if (!userExists) {
      existingUsers.push(demoUser);
      localStorage.setItem("demo_users", JSON.stringify(existingUsers));
    }

    // Set form values and auto-submit
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPassword);

    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form && !loading) {
        form.requestSubmit();
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">PAWMANITY</h1>
          </div>
          <p className="text-muted-foreground">Healthcare made simple</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your role and enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value: "doctor" | "patient") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Patient
                      </div>
                    </SelectItem>
                    <SelectItem value="doctor">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Doctor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Login Section */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Try demo accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("patient")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Patient Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("doctor")}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Doctor Demo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Demo credentials will be auto-filled
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Don't have an account? <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80" onClick={() => navigate('/signup')}>Sign Up</Button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
