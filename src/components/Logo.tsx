import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold inline-flex items-baseline">
      <span
        className="tracking-tighter bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #632D48 0%, #EDA04E 40%, #4DC47F 70%, #3B82F6 100%)",
        }}
      >
        NΞMU
      </span>
      <span
        className="text-sm bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #3B82F6 0%, #632D48 100%)",
        }}
      >
        .py
      </span>
    </Link>
  );
};

export default Logo;