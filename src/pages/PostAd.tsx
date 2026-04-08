
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ImagePlus, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useListingsStore } from "@/store/listingsStore";
import LocationPicker from "@/components/LocationPicker";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { listingSchema } from "@/lib/validations";
import { useLanguage } from "@/contexts/LanguageContext";

const PostAd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const addListing = useListingsStore((state) => state.addListing);
  const updateListing = useListingsStore((state) => state.updateListing);
  const listings = useListingsStore((state) => state.listings);
  const { uploadMultipleImages, uploading } = useImageUpload();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [currency, setCurrency] = useState("PYG");
  const [area, setArea] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [fuelType, setFuelType] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState({ 
    address: 'Asunción, Paraguay', 
    latitude: -25.2637, 
    longitude: -57.5759 
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: t('auth.required'),
        description: t('auth.requiredDesc'),
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, loading, navigate, t]);

  const isEditing = !!id;
  const editingListing = isEditing ? listings.find(l => l.id === id) : null;

  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title);
      setDescription(editingListing.description || "");
      setCategory(editingListing.type);
      setPhone(editingListing.phone || "");
      setPrice((editingListing as any).price || "");
      setArea((editingListing as any).area || "");
      setYear((editingListing as any).year || "");
      setFuelType((editingListing as any).fuel_type || "");
      setPreviews(editingListing.images || []);
      setLocation({
        address: editingListing.location,
        latitude: editingListing.latitude || 0,
        longitude: editingListing.longitude || 0
      });
    }
  }, [editingListing]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + previews.length > 5) {
      toast({
        title: t('postAd.maxPhotos'),
        description: t('postAd.maxPhotosDesc'),
        variant: "destructive",
      });
      return;
    }

    // Generate preview URLs for immediate display
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...files]);
    
    toast({
      title: t('postAd.imagesAdded'),
      description: `${files.length} ${t('postAd.imagesAddedDesc')}`,
    });
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t('postAd.error'),
        description: t('postAd.authError'),
        variant: "destructive",
      });
      return;
    }

    if (uploading) {
      toast({
        title: t('postAd.wait'),
        description: t('postAd.waitDesc'),
      });
      return;
    }

    // Validate input data
    try {
      listingSchema.parse({
        title: title.trim(),
        description: description.trim(),
        phone: phone.trim() || "",
        category,
        price: price || 0,
        area: area || 0,
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        location: location.address.trim()
      });
    } catch (error: any) {
      // Provide more specific error messages (Zod v4 uses 'issues' instead of 'errors')
      const issues = error.issues || error.errors || [];
      const errorMessage = issues[0]?.message || t('postAd.fieldError');
      const errorPath = issues[0]?.path?.[0];
      
      let userFriendlyMessage = errorMessage;
      
      if (errorPath === 'location' || errorPath === 'latitude' || errorPath === 'longitude') {
        userFriendlyMessage = t('postAd.locationError');
      } else if (errorPath === 'category') {
        userFriendlyMessage = t('postAd.categoryError');
      } else if (errorPath === 'title') {
        userFriendlyMessage = t('postAd.titleError');
      } else if (errorPath === 'description') {
        userFriendlyMessage = t('postAd.descriptionError');
      }
      
      toast({
        title: t('postAd.validationError'),
        description: userFriendlyMessage,
        variant: "destructive",
      });
      return;
    }

    // Upload new images to Cloud storage
    let uploadedImageUrls: string[] = [];
    if (imageFiles.length > 0) {
      uploadedImageUrls = await uploadMultipleImages(imageFiles);
      if (uploadedImageUrls.length === 0) {
        toast({
          title: t('postAd.error'),
          description: t('postAd.uploadError'),
          variant: "destructive",
        });
        return;
      }
    }

    // If editing, keep existing images that weren't removed
    const finalImages = isEditing 
      ? [...(editingListing?.images || []).filter(img => previews.includes(img)), ...uploadedImageUrls]
      : uploadedImageUrls;

    const listingData = {
      title: title.trim(),
      rating: null,
      description: description.trim(),
      category,
      type: category as any,
      location: location.address || "Asunción, Paraguay",
      images: finalImages,
      phone: phone.trim() || null,
      price: price || null,
      area: area || null,
      year: category === "vehicles" && year ? year : null,
      fuel_type: category === "vehicles" && fuelType ? fuelType : null,
      latitude: location.latitude,
      longitude: location.longitude,
      user_id: user.id,
    };

    // Save to backend database
    try {
      if (isEditing && editingListing) {
        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', String(editingListing.id));
        
        if (error) throw error;

        updateListing(editingListing.id, listingData);
        toast({
          title: t('postAd.updated'),
          description: t('postAd.updatedDesc'),
        });
      } else {
        const { error } = await supabase
          .from('listings')
          .insert([listingData]);
        
        if (error) throw error;

        addListing(listingData);
        toast({
          title: t('postAd.published'),
          description: t('postAd.publishedDesc'),
        });
      }
      
      navigate("/");
    } catch (error: any) {
      console.error('Database error:', error);
      
      let userMessage = t('postAd.saveErrorDesc');
      
      if (error.code === '23505') {
        userMessage = t('postAd.duplicateError');
      } else if (error.code === '23503') {
        userMessage = t('postAd.fieldError');
      } else if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        userMessage = t('postAd.permissionError');
      }
      
      toast({
        title: t('postAd.saveError'),
        description: userMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-muted-foreground">{t('postAd.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-3 sm:px-4">
      <div className="container max-w-2xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToHome')}
          </Link>
        </Button>
        <Card className="border-none shadow-lg bg-card">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {isEditing ? t('postAd.editTitle') : t('postAd.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('postAd.adTitle')}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('postAd.adTitlePlaceholder')}
                  required
                  className="h-11 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('postAd.category')} *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-card border-input h-11 sm:h-10">
                    <SelectValue placeholder={t('postAd.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-popover border border-border shadow-xl"
                    position="popper"
                    sideOffset={4}
                  >
                    <SelectItem value="vehicles">{t('postAd.categoryVehicles')}</SelectItem>
                    <SelectItem value="real-estate">{t('postAd.categoryRealEstate')}</SelectItem>
                    <SelectItem value="services">{t('postAd.categoryServices')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t('postAd.price')}</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder={t('postAd.pricePlaceholder')}
                  min="0"
                  className="h-11 sm:h-10"
                />
              </div>

              {category === "real-estate" && (
                <div className="space-y-2">
                  <Label htmlFor="area">{t('postAd.area')}</Label>
                  <Input
                    id="area"
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")}
                    placeholder={t('postAd.areaPlaceholder')}
                    min="0"
                    className="h-11 sm:h-10"
                  />
                </div>
              )}

              {category === "vehicles" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="year">{t('postAd.year')}</Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                      placeholder={t('postAd.yearPlaceholder')}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="h-11 sm:h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">{t('postAd.fuelType')}</Label>
                    <Select value={fuelType} onValueChange={setFuelType}>
                      <SelectTrigger className="bg-card border-input h-11 sm:h-10">
                        <SelectValue placeholder={t('postAd.fuelTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                        <SelectItem value="gasoline">{t('postAd.fuelGasoline')}</SelectItem>
                        <SelectItem value="diesel">{t('postAd.fuelDiesel')}</SelectItem>
                        <SelectItem value="electric">{t('postAd.fuelElectric')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <LocationPicker
                onLocationSelect={setLocation}
                initialAddress={location.address}
              />

              <div className="space-y-2">
                <Label htmlFor="phone">{t('postAd.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('postAd.phonePlaceholder')}
                  className="h-11 sm:h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('postAd.description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('postAd.descriptionPlaceholder')}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">{t('postAd.photos')}</Label>
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow-md hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <div className="aspect-square">
                      <Label
                        htmlFor="image-upload"
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors"
                      >
                        <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        <span className="mt-2 text-xs sm:text-sm text-muted-foreground text-center px-2">
                          {t('postAd.addPhoto')}
                        </span>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        multiple
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto"
                >
                  {t('postAd.cancel')}
                </Button>
                <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                  {uploading ? t('postAd.uploading') : isEditing ? t('postAd.saveChanges') : t('postAd.publish')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostAd;
