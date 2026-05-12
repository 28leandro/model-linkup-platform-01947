import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold inline-flex items-baseline">
      <span
        className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-600"
      >
        NΞMU
      </span>
      <span
        className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-600"
      >
        .py
      </span>
    </Link>
  );
};

export default Logo;