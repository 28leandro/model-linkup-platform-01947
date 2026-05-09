import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t mt-12 py-6 bg-muted/30">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} NΞMU.py</p>
        <nav className="flex items-center gap-4">
          <Link to="/refund-policy" className="hover:text-primary transition-colors">
            Política de Reembolso
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;