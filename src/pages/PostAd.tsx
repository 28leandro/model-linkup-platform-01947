
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { ImagePlus, X } from "lucide-react";
import { useListingsStore } from "@/store/listingsStore";

const PostAd = () => {
  const navigate = useNavigate();
  const addListing = useListingsStore((state) => state.addListing);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas ajouter plus de 5 images",
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
    
    // Simuler l'upload des images et obtenir les URLs
    const imageUrls = previews;
    
    addListing({
      title,
      rating,
      description,
      category,
      location: "Paris",
      images: imageUrls,
      phone,
    });
    
    toast({
      title: "Annonce publiée !",
      description: "Votre annonce a été publiée avec succès.",
    });
    
    // Nettoyer les URLs des aperçus
    previews.forEach(preview => URL.revokeObjectURL(preview));
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container max-w-2xl">
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Déposer une annonce</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: iPhone 13 Pro Max - 256Go"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="vehicles">Véhicules</SelectItem>
                    <SelectItem value="real-estate">Immobilier</SelectItem>
                    <SelectItem value="multimedia">Multimédia</SelectItem>
                    <SelectItem value="home">Maison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Évaluation (1 à 5 étoiles)</Label>
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

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 06 12 34 56 78"
                  pattern="[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}"
                  title="Format: 06 12 34 56 78"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre article en détail..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Photos (max 5)</Label>
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
                          Ajouter une photo
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

              <div className="flex justify-end">
                <Button type="submit">
                  Publier l'annonce
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
