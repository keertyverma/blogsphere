import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center md:mr-12">
      <img
        src="/assets/images/logo.png"
        alt="logo"
        width={60}
        height={60}
        className="object-contain"
      />
      <h1 className="text-xl font-bold text-slate-900 max-sm:hidden">
        BlogSphere
      </h1>
    </Link>
  );
};

export default Logo;
