import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold">
      <span className="text-[#632D48] tracking-tighter">T</span>
      <span className="text-[#EDA04E] tracking-tighter">R</span>
      <span className="text-[#4DC47F] tracking-tighter">O</span>
      <span className="text-[#3B82F6] tracking-tighter">C</span>
      <span className="text-sm">.py</span>
    </Link>
  );
};

export default Logo;