import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO
        title="Página no encontrada | NEMU.py"
        description="La página que buscás no existe o fue movida. Volvé al inicio de NEMU.py."
        canonical="/404"
        noIndex
      />
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary mb-3">Error 404</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground mb-6">
          La página que buscás no existe o fue movida. Podés volver al inicio y
          seguir explorando publicaciones de vehículos, inmuebles y servicios en
          Paraguay.
        </p>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
