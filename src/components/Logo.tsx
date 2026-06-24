import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold inline-flex items-center gap-2">
      <img
        src="/favicon-v5-512.png?v=6"
        alt="NEMU"
        width={36}
        height={36}
        className="w-9 h-9 drop-shadow-sm"
      />
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