
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

const PostAd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const addListing = useListingsStore((state) => state.addListing);
  const updateListing = useListingsStore((state) => state.updateListing);
  const listings = useListingsStore((state) => state.listings);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState({ address: '', latitude: 0, longitude: 0 });

  const isEditing = !!id;
  const editingListing = isEditing ? listings.find(l => l.id === Number(id)) : null;

  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title);
      setRating(editingListing.rating);
      setDescription(editingListing.description || "");
      setCategory(editingListing.type);
      setPhone(editingListing.phone || "");
      setPreviews(editingListing.images || []);
      setLocation({
        address: editingListing.location,
        latitude: editingListing.latitude || 0,
        longitude: editingListing.longitude || 0
      });
    }
  }, [editingListing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Erro",
        description: "Você não pode adicionar mais de 5 imagens",
        variant: "destructive",
      });
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageUrls = previews;
    
    const listingData = {
      title,
      rating,
      description,
      category,
      type: category as any,
      location: location.address || "Asunción, Paraguay",
      images: imageUrls,
      phone,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    if (isEditing && editingListing) {
      updateListing(editingListing.id, listingData);
      toast({
        title: "Anúncio atualizado!",
        description: "Seu anúncio foi atualizado com sucesso.",
      });
    } else {
      addListing(listingData);
      toast({
        title: "Anúncio publicado!",
        description: "Seu anúncio foi publicado com sucesso.",
      });
    }
    
    previews.forEach(preview => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    
    navigate("/");
  };

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
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="vehicles">🚗 Veículos</SelectItem>
                    <SelectItem value="real-estate">🏠 Imóveis</SelectItem>
                    <SelectItem value="services">🛠️ Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Avaliação (1 a 5 estrelas)</Label>
                <Input
                  id="rating"
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  min="1"
                  max="5"
                  required
                />
              </div>

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
                        className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
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
                <Button type="submit">
                  {isEditing ? "Salvar alterações" : "Publicar anúncio"}
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
