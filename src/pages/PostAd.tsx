
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

const FREE_PHOTOS = 3;
const MAX_PHOTOS_UNLOCKED = 10;

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
  // Dynamic per-category attributes
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const setAttr = (k: string, v: any) => setAttributes((p) => ({ ...p, [k]: v }));
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState({ 
    address: 'Asunción, Paraguay', 
    latitude: -25.2637, 
    longitude: -57.5759 
  });
  const [originalListing, setOriginalListing] = useState<any>(null);
  const [photosUnlocked, setPhotosUnlocked] = useState(false);

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
  const editingListing = isEditing
    ? (originalListing || listings.find(l => l.id === id))
    : null;

  // Fetch the original listing from the backend so edits start with fresh,
  // complete data (the local store may be stale or not yet hydrated).
  useEffect(() => {
    if (!isEditing || !id || !user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!cancelled && !error && data) {
        // phone column is no longer readable directly; fetch via SECURITY DEFINER fn
        const { data: phoneData } = await supabase.rpc('get_my_listing_phone', { listing_uuid: id });
        setOriginalListing({ ...(data as any), phone: phoneData ?? null });
      }
      if (!cancelled && data && (data as any).photos_unlocked) setPhotosUnlocked(true);
    })();
    return () => { cancelled = true; };
  }, [isEditing, id, user]);

  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title);
      setDescription(editingListing.description || "");
      setCategory((editingListing as any).category || editingListing.type || "");
      setPhone(editingListing.phone || "");
      setPrice((editingListing as any).price || "");
      setCurrency((editingListing as any).currency || "PYG");
      setArea((editingListing as any).area || "");
      setYear((editingListing as any).year || "");
      setFuelType((editingListing as any).fuel_type || "");
      setAttributes(((editingListing as any).attributes as any) || {});
      setPreviews(editingListing.images || []);
      if ((editingListing as any).photos_unlocked) setPhotosUnlocked(true);
      setLocation({
        address: editingListing.location,
        latitude: editingListing.latitude || 0,
        longitude: editingListing.longitude || 0
      });
    }
  }, [editingListing?.id]);

  const maxPhotos = photosUnlocked ? MAX_PHOTOS_UNLOCKED : FREE_PHOTOS;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = files.length + previews.length;
    if (!photosUnlocked && total > FREE_PHOTOS) {
      toast({
        title: "Límite gratuito alcanzado",
        description: "Solo puedes subir 3 fotos gratis. Desbloquea fotos ilimitadas para continuar.",
        variant: "destructive",
      });
      const qs = id ? `?listing_id=${id}` : "";
      navigate(`/photo-paywall${qs}`);
      e.target.value = "";
      return;
    }
    if (total > MAX_PHOTOS_UNLOCKED) {
      toast({
        title: t('postAd.maxPhotos'),
        description: `Máximo ${MAX_PHOTOS_UNLOCKED} fotos`,
        variant: "destructive",
      });
      e.target.value = "";
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

    // Build full candidate values
    const candidate = {
      title: title.trim(),
      description: description.trim(),
      phone: phone.trim() || "",
      category,
      price: price || 0,
      area: area || 0,
      latitude: location.latitude || 0,
      longitude: location.longitude || 0,
      location: location.address.trim(),
    };

    // When editing, only validate fields that actually changed
    let toValidate: any = candidate;
    if (isEditing && editingListing) {
      const o: any = editingListing;
      const changed: any = {};
      if (candidate.title !== (o.title || "")) changed.title = candidate.title;
      if (candidate.description !== (o.description || "")) changed.description = candidate.description;
      if (candidate.phone !== (o.phone || "")) changed.phone = candidate.phone;
      if (candidate.category !== (o.category || o.type || "")) changed.category = candidate.category;
      if (Number(candidate.price) !== Number(o.price || 0)) changed.price = candidate.price;
      if (Number(candidate.area) !== Number(o.area || 0)) changed.area = candidate.area;
      if (candidate.location !== (o.location || "")) changed.location = candidate.location;
      if (candidate.latitude !== (o.latitude || 0)) changed.latitude = candidate.latitude;
      if (candidate.longitude !== (o.longitude || 0)) changed.longitude = candidate.longitude;
      toValidate = changed;
    }

    try {
      const partial = listingSchema.partial();
      partial.parse(toValidate);
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

    // Build full base payload (for new listings) or compute a diff (for edits)
    const orig: any = editingListing || {};
    // Compute completeness rating (1-5) based on filled fields for the category
    const computeRating = () => {
      const base = [
        !!title.trim(),
        !!description.trim() && description.trim().length >= 20,
        !!category,
        !!location.address?.trim(),
        !!phone.trim(),
        Number(price) > 0,
        finalImages.length > 0,
      ];
      let extra: boolean[] = [];
      if (category === "vehicles") {
        extra = [
          !!attributes.brand, !!attributes.model, !!year,
          !!attributes.mileage, !!fuelType, !!attributes.transmission,
        ];
      } else if (category === "real-estate") {
        extra = [
          !!attributes.propertyType, !!attributes.bedrooms,
          !!attributes.bathrooms, !!area, attributes.parking !== undefined,
        ];
      } else if (category === "services") {
        extra = [
          !!attributes.schedule, !!attributes.coverage,
          description.trim().length >= 80,
        ];
      }
      const all = [...base, ...extra];
      const filled = all.filter(Boolean).length;
      const ratio = filled / all.length;
      return Math.max(1, Math.min(5, Math.round(ratio * 5)));
    };
    const autoRating = computeRating();
    const fullData: any = {
      title: title.trim() || orig.title,
      rating: autoRating,
      description: description.trim() || orig.description,
      category: category || orig.category,
      type: (category || orig.type) as any,
      location: location.address.trim() || orig.location || "Asunción, Paraguay",
      images: finalImages.length > 0 ? finalImages : (orig.images || []),
      phone: (phone.trim() || orig.phone) || null,
      price: (price === "" ? orig.price : price) ?? null,
      currency: currency || orig.currency,
      area: (area === "" ? orig.area : area) ?? null,
      year: category === "vehicles" ? ((year === "" ? orig.year : year) ?? null) : (isEditing ? orig.year ?? null : null),
      fuel_type: category === "vehicles" ? (fuelType || orig.fuel_type || null) : (isEditing ? orig.fuel_type ?? null : null),
      attributes: attributes || {},
      latitude: location.latitude ?? orig.latitude,
      longitude: location.longitude ?? orig.longitude,
      user_id: user.id,
    };

    // Compute partial payload with only modified fields for updates
    const buildDiff = () => {
      const diff: any = {};
      const keys = [
        "title","description","category","type","location","phone","price",
        "currency","area","year","fuel_type","latitude","longitude","rating",
      ];
      for (const k of keys) {
        const a = fullData[k];
        const b = orig[k];
        const eq = (a === b) || (a == null && b == null) ||
          (typeof a === "number" && Number(a) === Number(b));
        if (!eq) diff[k] = a;
      }
      // attributes (jsonb) - compare as JSON
      const origAttrs = JSON.stringify(orig.attributes || {});
      const newAttrs = JSON.stringify(fullData.attributes || {});
      if (origAttrs !== newAttrs) diff.attributes = fullData.attributes;
      // Images: only include if changed (added/removed)
      const origImgs = orig.images || [];
      const newImgs = fullData.images || [];
      const imgsChanged = origImgs.length !== newImgs.length ||
        origImgs.some((u: string, i: number) => u !== newImgs[i]);
      if (imgsChanged) diff.images = newImgs;
      return diff;
    };

    // Save to backend database
    try {
      if (isEditing && editingListing) {
        const diff = buildDiff();
        // Guard: prevent saving more than free photos without unlock
        if (!photosUnlocked && finalImages.length > FREE_PHOTOS) {
          toast({
            title: "Pago necesario",
            description: "Desbloquea fotos ilimitadas para guardar más de 3 fotos.",
            variant: "destructive",
          });
          navigate(`/photo-paywall?listing_id=${editingListing.id}`);
          return;
        }
        if (Object.keys(diff).length === 0) {
          toast({ title: t('postAd.updated'), description: "Sin cambios para guardar" });
          navigate(-1);
          return;
        }
        const { error } = await supabase
          .from('listings')
          .update(diff)
          .eq('id', String(editingListing.id));
        if (error) throw error;

        updateListing(editingListing.id, diff);
        toast({
          title: t('postAd.updated'),
          description: t('postAd.updatedDesc'),
        });
        navigate(-1);
        return;
      } else {
        const totalPhotos = finalImages.length;
        const requiresPayment = totalPhotos > FREE_PHOTOS && !photosUnlocked;
        const insertData = { ...fullData, is_published: !requiresPayment, photos_unlocked: photosUnlocked };

        const { data: inserted, error } = await supabase
          .from('listings')
          .insert([insertData])
          .select()
          .single();
        
        if (error) throw error;

        addListing(fullData);

        if (requiresPayment && inserted) {
          toast({ title: "Pago necesario", description: "Desbloquea fotos ilimitadas para publicar este anuncio" });
          navigate(`/photo-paywall?listing_id=${inserted.id}`);
          return;
        }

        toast({ title: t('postAd.published'), description: t('postAd.publishedDesc') });
        navigate("/");
        return;
      }
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

              {category === "vehicles" && (
                <div className="space-y-2">
                  <Label>Tipo de vehículo</Label>
                  <Select value={attributes.vehicleType || ""} onValueChange={(v) => setAttr("vehicleType", v)}>
                    <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Auto / Moto" /></SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                      <SelectItem value="car">Auto</SelectItem>
                      <SelectItem value="moto">Moto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="price">{t('postAd.price')}</Label>
                <div className="flex gap-2">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[100px] h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PYG">Gs.</SelectItem>
                      <SelectItem value="USD">US$</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {currency === "USD" ? "US$" : "Gs."}
                    </span>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder={currency === "USD" ? "Ej: 1500" : "Ej: 50000000"}
                      min="0"
                      className="h-11 sm:h-10 pl-12"
                    />
                  </div>
                </div>
              </div>

              {category === "real-estate" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Tipo de inmueble</Label>
                    <Select value={attributes.propertyType || ""} onValueChange={(v) => setAttr("propertyType", v)}>
                      <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Casa / Apartamento / Terreno" /></SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {attributes.propertyType !== "land" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Habitaciones</Label>
                        <Input id="bedrooms" type="number" min="0" value={attributes.bedrooms ?? ""} onChange={(e) => setAttr("bedrooms", e.target.value ? Number(e.target.value) : "")} className="h-11 sm:h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Baños</Label>
                        <Input id="bathrooms" type="number" min="0" value={attributes.bathrooms ?? ""} onChange={(e) => setAttr("bathrooms", e.target.value ? Number(e.target.value) : "")} className="h-11 sm:h-10" />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="area">Área total (m²)</Label>
                    <Input id="area" type="number" min="0" value={area} onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")} placeholder="m²" className="h-11 sm:h-10" />
                  </div>
                  {attributes.propertyType !== "land" && (
                    <div className="space-y-2">
                      <Label>Estacionamiento</Label>
                      <Select value={attributes.parking === undefined ? "" : (attributes.parking ? "yes" : "no")} onValueChange={(v) => setAttr("parking", v === "yes")}>
                        <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                          <SelectItem value="yes">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {category === "vehicles" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attributes.vehicleType === "moto" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Marca</Label>
                        <Select value={attributes.brand || ""} onValueChange={(v) => setAttr("brand", v)}>
                          <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                            {["Kenton","Star","Leopard","Taiga","Honda","Yamaha","Kawasaki","Suzuki","BMW","KTM","Harley-Davidson","Otra"].map(b => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input id="model" value={attributes.model || ""} onChange={(e) => setAttr("model", e.target.value)} placeholder="Ej: CG 150" className="h-11 sm:h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cilindrada (CC)</Label>
                        <Select value={attributes.engineCC || ""} onValueChange={(v) => setAttr("engineCC", v)}>
                          <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                            {["110cc","125cc","150cc","200cc","250cc","600cc","1000cc+"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de moto</Label>
                        <Select value={attributes.motoType || ""} onValueChange={(v) => setAttr("motoType", v)}>
                          <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                            <SelectItem value="urban">Urbana</SelectItem>
                            <SelectItem value="trail">Trail/Enduro</SelectItem>
                            <SelectItem value="scooter">Motoneta/Scooter</SelectItem>
                            <SelectItem value="sport">Deportiva</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="quad">Cuatriciclo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de partida</Label>
                        <Select value={attributes.startType || ""} onValueChange={(v) => setAttr("startType", v)}>
                          <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                            <SelectItem value="electric">Eléctrica</SelectItem>
                            <SelectItem value="pedal">Pedal</SelectItem>
                            <SelectItem value="both">Ambas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">{t('postAd.year')}</Label>
                        <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} placeholder={t('postAd.yearPlaceholder')} min="1900" max={new Date().getFullYear() + 1} className="h-11 sm:h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Kilometraje (km)</Label>
                        <Input id="mileage" type="number" min="0" value={attributes.mileage ?? ""} onChange={(e) => setAttr("mileage", e.target.value ? Number(e.target.value) : "")} placeholder="Ej: 10000" className="h-11 sm:h-10" />
                      </div>
                    </>
                  ) : (
                  <>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Select value={attributes.brand || ""} onValueChange={(v) => setAttr("brand", v)}>
                      <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                        {["Toyota","Nissan","Chevrolet","Volkswagen","Hyundai","Kia","Mitsubishi","Suzuki","Honda","Mercedes-Benz","BMW","Ford","Mazda","Subaru","Lexus","Isuzu","Chery","JAC","Geely","Dongfeng","Great Wall","Renault","Peugeot","Fiat","Audi","Otra"].map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input id="model" value={attributes.model || ""} onChange={(e) => setAttr("model", e.target.value)} placeholder="Ej: Corolla" className="h-11 sm:h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">{t('postAd.year')}</Label>
                    <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} placeholder={t('postAd.yearPlaceholder')} min="1900" max={new Date().getFullYear() + 1} className="h-11 sm:h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Kilometraje (km)</Label>
                    <Input id="mileage" type="number" min="0" value={attributes.mileage ?? ""} onChange={(e) => setAttr("mileage", e.target.value ? Number(e.target.value) : "")} placeholder="Ej: 50000" className="h-11 sm:h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">{t('postAd.fuelType')}</Label>
                    <Select value={fuelType} onValueChange={setFuelType}>
                      <SelectTrigger className="bg-card border-input h-11 sm:h-10"><SelectValue placeholder={t('postAd.fuelTypePlaceholder')} /></SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                        <SelectItem value="gasoline">{t('postAd.fuelGasoline')}</SelectItem>
                        <SelectItem value="diesel">{t('postAd.fuelDiesel')}</SelectItem>
                        <SelectItem value="electric">{t('postAd.fuelElectric')}</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                        <SelectItem value="flex">Flex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cambio</Label>
                    <Select value={attributes.transmission || ""} onValueChange={(v) => setAttr("transmission", v)}>
                      <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Manual / Automático" /></SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} className="bg-popover border border-border shadow-xl">
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  </>
                  )}
                </div>
              )}

              {category === "services" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Horario de atención</Label>
                    <Input id="schedule" value={attributes.schedule || ""} onChange={(e) => setAttr("schedule", e.target.value)} placeholder="Ej: Lun-Vie 8-18h" className="h-11 sm:h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverage">Región de cobertura</Label>
                    <Input id="coverage" value={attributes.coverage || ""} onChange={(e) => setAttr("coverage", e.target.value)} placeholder="Ej: Asunción y Gran Asunción" className="h-11 sm:h-10" />
                  </div>
                </div>
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
                <Label htmlFor="images">
                  {t('postAd.photos')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {Math.min(previews.length, FREE_PHOTOS)}/{FREE_PHOTOS} fotos gratuito · hasta {MAX_PHOTOS_UNLOCKED} fotos pago
                </p>
                {!photosUnlocked && previews.length >= FREE_PHOTOS && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md border bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      💳 Has usado las 3 fotos gratuitas. Desbloquea hasta 10 fotos.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => navigate(`/photo-paywall${id ? `?listing_id=${id}` : ""}`)}
                    >
                      Desbloquear
                    </Button>
                  </div>
                )}
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
                  {previews.length < maxPhotos && (
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
