import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface DoctorProfile {
  id: number;
  name: string;
  specialization: string;
  experience_years?: number;
  phone?: string;
  bio?: string;
  is_available: boolean;
}

const Doctor = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience_years: "",
    phone: "",
    bio: "",
    is_available: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/doctor/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile(data);
          setFormData({
            name: data.name || "",
            specialization: data.specialization || "",
            experience_years: data.experience_years?.toString() || "",
            phone: data.phone || "",
            bio: data.bio || "",
            is_available: data.is_available || false,
          });
        } else {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to fetch doctor profile",
          variant: "destructive",
        });
      });
  }, [token]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    const payload = {
      ...formData,
      experience_years: formData.experience_years ? Number(formData.experience_years) : undefined,
    };

    try {
      const res = await fetch("http://localhost:5000/doctor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error while updating profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-cream-white p-6 font-serif text-forest-green">
      <Card className="max-w-3xl mx-auto border-2 border-forest-green bg-cream-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold italic">Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="italic">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => handleChange("name", e.target.value)}
                className="border-forest-green"
                required
              />
            </div>

            <div>
              <Label htmlFor="specialization" className="italic">Specialization</Label>
              <Input
                id="specialization"
                type="text"
                value={formData.specialization}
                onChange={e => handleChange("specialization", e.target.value)}
                className="border-forest-green"
                required
              />
            </div>

            <div>
              <Label htmlFor="experience_years" className="italic">Experience (years)</Label>
              <Input
                id="experience_years"
                type="number"
                min={0}
                value={formData.experience_years}
                onChange={e => handleChange("experience_years", e.target.value)}
                className="border-forest-green"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="italic">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e => handleChange("phone", e.target.value)}
                className="border-forest-green"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="italic">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e => handleChange("bio", e.target.value)}
                className="border-forest-green"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_available"
                type="checkbox"
                checked={formData.is_available}
                onChange={e => handleChange("is_available", e.target.checked)}
                className="accent-forest-green"
              />
              <Label htmlFor="is_available" className="italic">Available for consultations</Label>
            </div>

            <Button type="submit" disabled={loading} className="bg-forest-green text-cream-white hover:bg-dark-green">
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Doctor;
