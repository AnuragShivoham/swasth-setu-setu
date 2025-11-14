import { Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/integrations/supabase/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "doctor" | "patient";
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First try Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!sessionError && session) {
        // Fetch user profile from database
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!profileError && profileData) {
          const profile = profileData as Profile;
          setUserProfile(profile);
          setIsAuthenticated(true);

          // Update localStorage for quick access
          localStorage.setItem("userRole", profile.role);
          localStorage.setItem("userEmail", profile.email);
          localStorage.setItem("userId", profile.id);
          setLoading(false);
          return;
        }
      }

      // Fallback to localStorage demo users
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");
      const userId = localStorage.getItem("userId");

      if (userRole && userEmail && userId) {
        // Check if user exists in demo_users
        const demoUsers = JSON.parse(localStorage.getItem("demo_users") || "[]");
        const demoUser = demoUsers.find((u: any) => u.id === userId);

        if (demoUser) {
          setUserProfile(demoUser as Profile);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      }

      // No valid authentication found
      localStorage.clear();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.clear();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // If specific role required and doesn't match, redirect to appropriate page
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to={userProfile.role === "doctor" ? "/doctor" : "/home"} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
