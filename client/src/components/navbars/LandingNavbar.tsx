import { useNavigate } from "react-router-dom";
import DarkThemeToggler from "../shared/DarkThemeToggler";
import Logo from "../shared/Logo";
import { Button } from "../ui/button";

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="flex items-center">
        <Logo />
      </div>
      <div className="flex items-center gap-1 md:gap-4 ml-auto">
        <DarkThemeToggler />
        <Button
          onClick={() => navigate("/login")}
          variant="outline"
          className="max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:text-primary-foreground max-sm:active:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
        >
          Log in
        </Button>
        <Button
          onClick={() => navigate("/signup")}
          className="max-sm:hidden rounded-full"
        >
          Sign up
        </Button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
