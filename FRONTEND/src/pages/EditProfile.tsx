import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import Beams from '../components/Beams';

const EditProfile = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    experience_years: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/doctor/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "GET",
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        if (!data.error) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            specialization: data.specialization || '',
            experience_years: data.experience_years || '',
            bio: data.bio || ''
          });
        } else {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch doctor profile",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = () => {
    if (!token) return;
    fetch("http://localhost:5000/doctor/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "PUT",
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        bio: formData.bio
      })
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        if (data.message) {
          toast({
            title: 'Profile Updated',
            description: 'Your profile has been successfully updated.',
          });
          navigate('/doctor'); // Navigate to display updated profile
        } else {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-white p-6 font-serif text-forest-green flex items-center justify-center">
        <p className="text-xl italic">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-white p-6 font-serif text-forest-green relative overflow-hidden">
      <div className="absolute inset-0 brightness-75 contrast-125 -z-10">
        <Beams beamWidth={3} beamHeight={20} beamNumber={15} lightColor="#228B22" speed={1.5} noiseIntensity={1.5} scale={0.3} rotation={15} />
      </div>
      <div className="max-w-4xl mx-auto space-y-6 relative z-10 bg-white/60 backdrop-blur-lg shadow-lg rounded-2xl p-8 mx-4 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold italic text-forest-green mb-2">
            Edit Profile
          </h1>
          <p className="text-lg italic text-forest-green/80">
            Update your professional information
          </p>
        </div>

        <Card className="border-2 border-forest-green shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold italic text-forest-green">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-forest-green font-semibold italic">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-forest-green font-semibold italic">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter your phone number"
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-forest-green font-semibold italic">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="Enter your specialization"
                  className="border-forest-green/30 focus:border-forest-green"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-forest-green font-semibold italic">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                className="border-forest-green/30 focus:border-forest-green min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSave}
            className="bg-forest-green text-cream-white hover:bg-forest-green/90 italic px-8"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/doctor')}
            className="border-forest-green text-forest-green hover:bg-forest-green hover:text-cream-white italic px-8"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
