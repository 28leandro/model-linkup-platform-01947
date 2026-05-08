import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="text-[2.2rem] font-bold">
      <span className="text-[#632D48] tracking-tighter">N</span>
      <span className="text-[#EDA04E] tracking-tighter">E</span>
      <span className="text-[#4DC47F] tracking-tighter">O</span>
      <span className="text-sm">.py</span>
    </Link>
  );
};

export default Logo;