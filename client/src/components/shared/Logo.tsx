import { Link } from "react-router-dom";

interface LogoProps {
  withText?: boolean;
  className?: string;
  isHome?: boolean;
}

const Logo = ({ className, withText = true, isHome = false }: LogoProps) => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src={"/assets/images/logo.svg"}
        alt="logo"
        width={45}
        height={45}
        className={`object-contain ${className}`}
        loading="lazy"
      />
      {withText && (
        <h1
          className={`text-lg md:text-xl font-bold ml-1 ${
            isHome ? "max-sm:hidden" : ""
          }`}
        >
          BlogSphere
        </h1>
      )}
    </Link>
  );
};

export default Logo;
