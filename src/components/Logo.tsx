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
      <span className="text-sm font-bold" style={{ color: "#0038A8" }}>
        .py
      </span>
    </Link>
  );
};

export default Logo;