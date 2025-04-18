import { Link } from "react-router-dom";

interface LogoProps {
  withText?: boolean;
  className?: string;
}

const Logo = ({ className, withText = true }: LogoProps) => {
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
        <h1 className="max-sm:hidden text-lg md:text-xl font-bold ml-1">
          BlogSphere
        </h1>
      )}
    </Link>
  );
};

export default Logo;
