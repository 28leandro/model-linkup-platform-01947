
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { ImagePlus, X } from "lucide-react";
import { useListingsStore } from "@/store/listingsStore";
import LocationPicker from "@/components/LocationPicker";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { listingSchema } from "@/lib/validations";

const PostAd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const addListing = useListingsStore((state) => state.addListing);
  const updateListing = useListingsStore((state) => state.updateListing);
  const listings = useListingsStore((state) => state.listings);
  const { uploadMultipleImages, uploading } = useImageUpload();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [area, setArea] = useState<number | "">("");
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
        title: "Autenticação necessária",
        description: "Você precisa estar logado para publicar anúncios.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, loading, navigate]);

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
        title: "Erro",
        description: "Você não pode adicionar mais de 5 imagens",
        variant: "destructive",
      });
      return;
    }

    // Generate preview URLs for immediate display
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...files]);
    
    toast({
      title: "Imagens adicionadas!",
      description: `${files.length} imagem(ns) adicionada(s).`,
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
        title: "Erro",
        description: "Você precisa estar logado para publicar anúncios.",
        variant: "destructive",
      });
      return;
    }

    if (uploading) {
      toast({
        title: "Aguarde",
        description: "As imagens ainda estão sendo processadas.",
      });
      return;
    }

    // Validate input data
    try {
      listingSchema.parse({
        title,
        description,
        phone: phone || "",
        category,
        price: price || 0,
        area: area || 0,
        latitude: location.latitude,
        longitude: location.longitude,
        location: location.address
      });
    } catch (error: any) {
      // Provide more specific error messages
      const errorMessage = error.errors?.[0]?.message || "Verifique os campos do formulário.";
      const errorPath = error.errors?.[0]?.path?.[0];
      
      let userFriendlyMessage = errorMessage;
      
      if (errorPath === 'location' || errorPath === 'latitude' || errorPath === 'longitude') {
        userFriendlyMessage = "Por favor, selecione uma localização no mapa.";
      } else if (errorPath === 'category') {
        userFriendlyMessage = "Por favor, selecione uma categoria.";
      } else if (errorPath === 'title') {
        userFriendlyMessage = "O título deve ter entre 5 e 100 caracteres.";
      } else if (errorPath === 'description') {
        userFriendlyMessage = "A descrição deve ter entre 20 e 2000 caracteres.";
      }
      
      toast({
        title: "Erro de validação",
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
          title: "Erro",
          description: "Falha ao enviar imagens. Tente novamente.",
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
          title: "Anúncio atualizado!",
          description: "Seu anúncio foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('listings')
          .insert([listingData]);
        
        if (error) throw error;

        addListing(listingData);
        toast({
          title: "Anúncio publicado!",
          description: "Seu anúncio foi publicado com sucesso.",
        });
      }
      
      navigate("/");
    } catch (error: any) {
      console.error('Database error:', error);
      
      let userMessage = "Não foi possível salvar o anúncio. Tente novamente.";
      
      if (error.code === '23505') {
        userMessage = "Este anúncio já existe.";
      } else if (error.code === '23503') {
        userMessage = "Erro de validação. Verifique os campos.";
      } else if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        userMessage = "Você não tem permissão para esta ação.";
      }
      
      toast({
        title: "Erro ao salvar",
        description: userMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container max-w-2xl">
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEditing ? "Editar Anúncio" : "Publicar Anúncio"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Toyota Corolla 2020"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white border-input">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="vehicles">🚗 Veículos</SelectItem>
                    <SelectItem value="real-estate">🏠 Imóveis</SelectItem>
                    <SelectItem value="services">🛠️ Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (Gs)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ex: 50000000"
                  min="0"
                />
              </div>

              {category === "real-estate" && (
                <div className="space-y-2">
                  <Label htmlFor="area">Dimensões do Imóvel (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Ex: 150"
                    min="0"
                  />
                </div>
              )}

              <LocationPicker
                onLocationSelect={setLocation}
                initialAddress={location.address}
              />

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu anúncio em detalhes..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Fotos (máx 5)</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-primary"
                      >
                        <ImagePlus className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Adicionar foto
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

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Enviando..." : isEditing ? "Salvar alterações" : "Publicar anúncio"}
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
