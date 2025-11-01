import { Button } from "@/components/ui/button";
import { Plus, LogIn, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  return (
    <header className="bg-background shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link to="/favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" color="#D43A42" fill="#D43A42" />
              Coups de cœur
            </Link>
          </Button>
          <Button asChild>
            <Link to="/post-ad" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Déposer une annonce
            </Link>
          </Button>
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={onLoginClick}
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;