import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Stethoscope, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileInsert, DoctorProfileInsert } from "@/integrations/supabase/types";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "", // For doctors
    licenseNumber: "", // For doctors
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (role === "doctor") {
      if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: role,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Step 2: Create profile record
      const profileData: ProfileInsert = {
        id: authData.user.id,
        email: formData.email,
        full_name: formData.name,
        phone: formData.phone,
        role: role,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profileData);

      if (profileError) {
        throw profileError;
      }

      // Step 3: If doctor, create doctor profile
      if (role === "doctor") {
        const doctorProfileData: DoctorProfileInsert = {
          id: authData.user.id,
          specialization: formData.specialization,
          license_number: formData.licenseNumber,
        };

        const { error: doctorProfileError } = await supabase
          .from("doctor_profiles")
          .insert(doctorProfileData);

        if (doctorProfileError) {
          throw doctorProfileError;
        }
      }

      toast({
        title: "Account created successfully!",
        description: authData.user.identities?.length === 0 
          ? "Please check your email to verify your account."
          : "You can now login with your credentials.",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "Something went wrong. Please try again.";

      if (error.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (error.message?.includes("Password")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.includes("Email")) {
        errorMessage = "Please provide a valid email address.";
      } else if (error.message?.includes("email column") || error.message?.includes("schema cache")) {
        // Database not set up yet, use localStorage fallback
        const userData = {
          ...formData,
          role,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        const existingUsers = JSON.parse(localStorage.getItem("demo_users") || "[]");
        existingUsers.push(userData);
        localStorage.setItem("demo_users", JSON.stringify(existingUsers));

      toast({
        title: "Account created successfully!",
        description: "Please login with your credentials.",
      });

      // Clear any existing auth state to force login
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");

      navigate("/login");
        setLoading(false);
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="p-0 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create your account to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
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
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <div className="text-sm text-destructive">{errors.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <div className="text-sm text-destructive">{errors.email}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <div className="text-sm text-destructive">{errors.phone}</div>
                )}
              </div>

              {role === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select value={formData.specialization} onValueChange={(value) => handleInputChange("specialization", value)}>
                      <SelectTrigger className={errors.specialization ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general-medicine">General Medicine</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="gynecology">Gynecology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.specialization && (
                      <div className="text-sm text-destructive">{errors.specialization}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Medical License Number *</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                      placeholder="Enter your medical license number"
                      className={errors.licenseNumber ? "border-destructive" : ""}
                    />
                    {errors.licenseNumber && (
                      <div className="text-sm text-destructive">{errors.licenseNumber}</div>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a password"
                    className={errors.password ? "border-destructive" : ""}
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
                {errors.password && (
                  <div className="text-sm text-destructive">{errors.password}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <div className="text-sm text-destructive">{errors.confirmPassword}</div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Already have an account? <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80" onClick={() => navigate('/login')}>Sign In</Button></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
