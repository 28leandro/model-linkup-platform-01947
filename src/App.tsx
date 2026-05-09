import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostAd from "./pages/PostAd";
import ListingDetail from "./pages/ListingDetail";
import CategoryPage from "./pages/CategoryPage";
import FavoriteThings from "./pages/FavoriteThings";
import MapView from "./pages/MapView";
import PaymentSuccess from "./pages/PaymentSuccess";
import RefundPolicy from "./pages/RefundPolicy";
import PhotoPaywall from "./pages/PhotoPaywall";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
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
          <Route path="/photo-paywall" element={<PhotoPaywall />} />
        </Routes>
        <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;