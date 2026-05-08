import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold">
      <span className="text-[#632D48] tracking-tighter">Ñ</span>
      <span className="text-[#EDA04E] tracking-tighter">e</span>
      <span className="text-[#4DC47F] tracking-tighter">mu</span>
      <span className="text-sm text-[#0038A8]">.py</span>
    </Link>
  );
};

export default Logo;