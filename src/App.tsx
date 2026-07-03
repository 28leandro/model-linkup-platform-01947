import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
// Route-level code splitting: only the home route is eager.
// All other pages are loaded on demand to shrink the initial JS bundle.
const PostAd = lazy(() => import("./pages/PostAd"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const FavoriteThings = lazy(() => import("./pages/FavoriteThings"));
const MapView = lazy(() => import("./pages/MapView"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Trust = lazy(() => import("./pages/Trust"));
const PhotoPaywall = lazy(() => import("./pages/PhotoPaywall"));
const Inbox = lazy(() => import("./pages/Inbox"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PagoparTest = lazy(() => import("./pages/PagoparTest"));
const MyListings = lazy(() => import("./pages/MyListings"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const Unae = lazy(() => import("./pages/Unae"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
          <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
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
            <Route path="/unae" element={<Unae />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </div>
        <BottomNav />
        <NetworkBanner />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
