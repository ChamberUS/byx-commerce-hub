import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Auth pages
import Splash from "./pages/auth/Splash";
import Intro from "./pages/auth/Intro";
import ProfileChoice from "./pages/auth/ProfileChoice";
import Login from "./pages/auth/Login";
import VerifyOTP from "./pages/auth/VerifyOTP";
import CompleteProfile from "./pages/auth/CompleteProfile";
import Terms from "./pages/auth/Terms";
import Success from "./pages/auth/Success";

// App pages
import Home from "./pages/app/Home";
import Account from "./pages/app/Account";
import Security from "./pages/app/Security";
import Notifications from "./pages/app/Notifications";
import Privacy from "./pages/app/Privacy";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Splash */}
            <Route path="/" element={<Splash />} />

            {/* Auth routes - public */}
            <Route
              path="/auth/intro"
              element={
                <AuthGuard>
                  <Intro />
                </AuthGuard>
              }
            />
            <Route
              path="/auth/profile-choice"
              element={
                <AuthGuard>
                  <ProfileChoice />
                </AuthGuard>
              }
            />
            <Route
              path="/auth/login"
              element={
                <AuthGuard>
                  <Login />
                </AuthGuard>
              }
            />
            <Route
              path="/auth/verify"
              element={
                <AuthGuard>
                  <VerifyOTP />
                </AuthGuard>
              }
            />

            {/* Auth routes - requires auth but not complete onboarding */}
            <Route
              path="/auth/complete-profile"
              element={
                <AuthGuard requireAuth>
                  <CompleteProfile />
                </AuthGuard>
              }
            />
            <Route
              path="/auth/terms"
              element={
                <AuthGuard requireAuth>
                  <Terms />
                </AuthGuard>
              }
            />
            <Route
              path="/auth/success"
              element={
                <AuthGuard requireAuth>
                  <Success />
                </AuthGuard>
              }
            />

            {/* App routes - requires auth and complete onboarding */}
            <Route
              path="/app"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/app/account"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Account />
                </AuthGuard>
              }
            />
            <Route
              path="/app/account/security"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Security />
                </AuthGuard>
              }
            />
            <Route
              path="/app/account/notifications"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Notifications />
                </AuthGuard>
              }
            />
            <Route
              path="/app/account/privacy"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Privacy />
                </AuthGuard>
              }
            />

            {/* Placeholder routes for BottomNav */}
            <Route
              path="/app/search"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/app/orders"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/app/wallet"
              element={
                <AuthGuard requireAuth requireOnboarding>
                  <Home />
                </AuthGuard>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;