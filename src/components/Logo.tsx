import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold inline-flex items-baseline">
      <span
        className="tracking-tighter bg-clip-text text-transparent"
        style={{ backgroundImage: "var(--gradient-logo)" }}
      >
        NΞMU
      </span>
      <span
        className="text-sm bg-clip-text text-transparent"
        style={{ backgroundImage: "var(--gradient-logo-suffix)" }}
      >
        .py
      </span>
    </Link>
  );
};

export default Logo;