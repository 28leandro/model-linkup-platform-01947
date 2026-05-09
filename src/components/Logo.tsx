import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold inline-flex items-baseline">
      <span
        className="tracking-tighter bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--accent)) 100%)",
        }}
      >
        NΞMU
      </span>
      <span
        className="text-sm bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--secondary)) 100%)",
        }}
      >
        .py
      </span>
    </Link>
  );
};

export default Logo;