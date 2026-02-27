import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
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
import EditProfile from "./pages/app/EditProfile";
import Security from "./pages/app/Security";
import Notifications from "./pages/app/Notifications";
import Privacy from "./pages/app/Privacy";
import Wallet from "./pages/app/Wallet";
import WalletSetup from "./pages/app/WalletSetup";

// Marketplace pages
import SearchPage from "./pages/app/Search";
import ProductDetail from "./pages/app/ProductDetail";
import StorePage from "./pages/app/StorePage";
import FavoritesPage from "./pages/app/Favorites";
import Orders from "./pages/app/Orders";
import OrderDetail from "./pages/app/OrderDetail";
import ChatList from "./pages/app/ChatList";
import ChatRoom from "./pages/app/ChatRoom";
import Checkout from "./pages/app/Checkout";

// Seller pages
import SellerDashboard from "./pages/seller/Dashboard";
import CreateStore from "./pages/seller/CreateStore";
import EditStore from "./pages/seller/EditStore";
import SellerProducts from "./pages/seller/Products";
import ProductForm from "./pages/seller/ProductForm";
import CreateListingWizard from "./pages/seller/CreateListingWizard";
import StoreOrders from "./pages/seller/StoreOrders";
import QuickReplies from "./pages/seller/QuickReplies";

// Legal pages
import LegalTerms from "./pages/legal/Terms";
import LegalPrivacy from "./pages/legal/Privacy";
 
 // Other pages
 import FAQ from "./pages/app/FAQ";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WalletProvider>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/auth/intro" element={<AuthGuard><Intro /></AuthGuard>} />
              <Route path="/auth/profile-choice" element={<AuthGuard><ProfileChoice /></AuthGuard>} />
              <Route path="/auth/login" element={<AuthGuard><Login /></AuthGuard>} />
              <Route path="/auth/verify" element={<AuthGuard><VerifyOTP /></AuthGuard>} />
              <Route path="/auth/complete-profile" element={<AuthGuard requireAuth><CompleteProfile /></AuthGuard>} />
              <Route path="/auth/terms" element={<AuthGuard requireAuth><Terms /></AuthGuard>} />
              <Route path="/auth/success" element={<AuthGuard requireAuth><Success /></AuthGuard>} />
              
              {/* Main App */}
              <Route path="/app" element={<AuthGuard requireAuth requireOnboarding><Home /></AuthGuard>} />
              <Route path="/app/search" element={<AuthGuard requireAuth requireOnboarding><SearchPage /></AuthGuard>} />
              <Route path="/app/product/:id" element={<AuthGuard requireAuth requireOnboarding><ProductDetail /></AuthGuard>} />
              <Route path="/app/store/:slug" element={<AuthGuard requireAuth requireOnboarding><StorePage /></AuthGuard>} />
              <Route path="/app/favorites" element={<AuthGuard requireAuth requireOnboarding><FavoritesPage /></AuthGuard>} />
              <Route path="/app/orders" element={<AuthGuard requireAuth requireOnboarding><Orders /></AuthGuard>} />
              <Route path="/app/orders/:id" element={<AuthGuard requireAuth requireOnboarding><OrderDetail /></AuthGuard>} />
              <Route path="/app/checkout" element={<AuthGuard requireAuth requireOnboarding><Checkout /></AuthGuard>} />
              <Route path="/app/chat" element={<AuthGuard requireAuth requireOnboarding><ChatList /></AuthGuard>} />
              <Route path="/app/chat/:conversationId" element={<AuthGuard requireAuth requireOnboarding><ChatRoom /></AuthGuard>} />
              
              {/* Account */}
              <Route path="/app/account" element={<AuthGuard requireAuth requireOnboarding><Account /></AuthGuard>} />
              <Route path="/app/account/edit" element={<AuthGuard requireAuth requireOnboarding><EditProfile /></AuthGuard>} />
              <Route path="/app/account/security" element={<AuthGuard requireAuth requireOnboarding><Security /></AuthGuard>} />
              <Route path="/app/account/notifications" element={<AuthGuard requireAuth requireOnboarding><Notifications /></AuthGuard>} />
              <Route path="/app/account/privacy" element={<AuthGuard requireAuth requireOnboarding><Privacy /></AuthGuard>} />
              
              {/* Wallet */}
              <Route path="/app/wallet" element={<AuthGuard requireAuth requireOnboarding><Wallet /></AuthGuard>} />
              <Route path="/app/wallet/setup" element={<AuthGuard requireAuth requireOnboarding><WalletSetup /></AuthGuard>} />
              
              {/* Seller Hub */}
              <Route path="/app/store" element={<AuthGuard requireAuth requireOnboarding><SellerDashboard /></AuthGuard>} />
              <Route path="/app/store/create" element={<AuthGuard requireAuth requireOnboarding><CreateStore /></AuthGuard>} />
              <Route path="/app/store/edit" element={<AuthGuard requireAuth requireOnboarding><EditStore /></AuthGuard>} />
              <Route path="/app/store/products" element={<AuthGuard requireAuth requireOnboarding><SellerProducts /></AuthGuard>} />
              <Route path="/app/store/products/new" element={<AuthGuard requireAuth requireOnboarding><CreateListingWizard /></AuthGuard>} />
              <Route path="/app/store/products/:id/edit" element={<AuthGuard requireAuth requireOnboarding><ProductForm /></AuthGuard>} />
              <Route path="/app/store/orders" element={<AuthGuard requireAuth requireOnboarding><StoreOrders /></AuthGuard>} />
              <Route path="/app/store/orders/:id" element={<AuthGuard requireAuth requireOnboarding><OrderDetail /></AuthGuard>} />
              <Route path="/app/store/quick-replies" element={<AuthGuard requireAuth requireOnboarding><QuickReplies /></AuthGuard>} />
               <Route path="/app/faq" element={<AuthGuard requireAuth requireOnboarding><FAQ /></AuthGuard>} />
              
              {/* Legal */}
              <Route path="/legal/terms" element={<LegalTerms />} />
              <Route path="/legal/privacy" element={<LegalPrivacy />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;