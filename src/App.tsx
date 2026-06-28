import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostAd from "./pages/PostAd";
import ListingDetail from "./pages/ListingDetail";
import CategoryPage from "./pages/CategoryPage";
import FavoriteThings from "./pages/FavoriteThings";
import MapView from "./pages/MapView";
import PaymentSuccess from "./pages/PaymentSuccess";
import RefundPolicy from "./pages/RefundPolicy";
import Trust from "./pages/Trust";
import PhotoPaywall from "./pages/PhotoPaywall";
import Inbox from "./pages/Inbox";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import PagoparTest from "./pages/PagoparTest";
import MyListings from "./pages/MyListings";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import BottomNav from "@/components/BottomNav";
import NetworkBanner from "@/components/NetworkBanner";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/post-ad/:id" element={<PostAd />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/favorites" element={<FavoriteThings />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/trust" element={<Trust />} />
            <Route path="/photo-paywall" element={<PhotoPaywall />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pagopar-test" element={<PagoparTest />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <BottomNav />
        <NetworkBanner />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
