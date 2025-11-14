import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Human from "./pages/Human";
import Pet from "./pages/Pet";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DoctorManagement from "./pages/DoctorManagement";
import DoctorProfile from "./pages/DoctorProfile";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={
            <AuthGuard requiredRole="patient">
              <Home />
            </AuthGuard>
          } />
          <Route path="/landing" element={
            <AuthGuard>
              <Index />
            </AuthGuard>
          } />
          <Route path="/human" element={
            <AuthGuard requiredRole="patient">
              <Human />
            </AuthGuard>
          } />
          <Route path="/pet" element={
            <AuthGuard requiredRole="patient">
              <Pet />
            </AuthGuard>
          } />
          <Route path="/doctor" element={
            <AuthGuard requiredRole="doctor">
              <DoctorManagement />
            </AuthGuard>
          } />
          <Route path="/doctor/profile" element={
            <AuthGuard requiredRole="doctor">
              <DoctorProfile />
            </AuthGuard>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
