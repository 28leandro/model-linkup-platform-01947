import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostAd from "./pages/PostAd";
import ListingDetail from "./pages/ListingDetail";
import CategoryPage from "./pages/CategoryPage";
import FavoriteThings from "./pages/FavoriteThings";
import MapView from "./pages/MapView";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/post-ad/:id" element={<PostAd />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/favorites" element={<FavoriteThings />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;