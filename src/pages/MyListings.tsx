import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Eye, EyeOff, Trash2, Plus, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/formatPrice";

interface Listing {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  images: string[] | null;
  is_published: boolean;
  location: string | null;
  created_at: string;
}

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id,title,price,currency,images,is_published,location,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setListings((data || []) as Listing[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [user]);

  const togglePublish = async (l: Listing) => {
    const { error } = await supabase
      .from("listings")
      .update({ is_published: !l.is_published })
      .eq("id", l.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: l.is_published ? "Anúncio pausado" : "Anúncio publicado" });
      fetchListings();
    }
  };

  const removeListing = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anúncio excluído" });
      fetchListings();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> {t("nav.home")}
            </Link>
          </Button>
          <h1 className="font-semibold flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> {t("nav.manageAds")}
          </h1>
          <Button size="sm" asChild>
            <Link to="/post-ad" className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
        ) : listings.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não tem anúncios.</p>
            <Button asChild>
              <Link to="/post-ad">{t("nav.postAd")}</Link>
            </Button>
          </Card>
        ) : (
          listings.map((l) => (
            <Card key={l.id} className="p-3 flex gap-3">
              <Link to={`/listing/${l.id}`} className="shrink-0">
                {l.images && l.images[0] ? (
                  <img src={l.images[0]} alt={l.title} loading="lazy" decoding="async" width={80} height={80} className="w-20 h-20 rounded object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded bg-muted" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/listing/${l.id}`} className="font-medium line-clamp-2 hover:underline">
                  {l.title}
                </Link>
                <p className="text-sm text-foreground font-semibold">
                  {l.price ? formatPrice(l.price, l.currency as any) : "—"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">{l.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/post-ad/${l.id}`}>
                      <Pencil className="w-3 h-3" /> Editar
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(l)}>
                    {l.is_published ? (
                      <><EyeOff className="w-3 h-3" /> Pausar</>
                    ) : (
                      <><Eye className="w-3 h-3" /> Publicar</>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-3 h-3" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeListing(l.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default MyListings;