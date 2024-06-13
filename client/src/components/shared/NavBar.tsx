import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import { BsBell, BsPencilSquare, BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import UserNavigationPanel from "../user-menu/UserNavigationPanel";
import Logo from "./Logo";

const NavBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="navbar">
      <Logo />
      <div className="flex items-center gap-1 md:gap-4 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/search")}
          className="bg-accent rounded-full flex-center"
        >
          <BsSearch className="text-l text-muted-foreground" />
        </Button>

        <Button
          onClick={() => navigate("/editor")}
          className="sm:flex-center max-sm:hidden rounded-full gap-2 ml-2"
        >
          <BsPencilSquare />
          Write
        </Button>

        {/* Mobile Screens */}
        <Button
          onClick={() => navigate("/editor")}
          variant="link"
          size="sm"
          className="max-sm:flex sm:hidden rounded-full gap-2"
        >
          <BsPencilSquare className="text-xl" />
        </Button>

        {isAuthenticated ? (
          <>
            <Button
              onClick={() => navigate("/dashboard/notification")}
              variant="link"
              size="icon"
              className="rounded-full md:bg-accent flex-center"
            >
              <BsBell className="text-xl md:text-l text-muted-foreground" />
            </Button>

            <UserNavigationPanel />
          </>
        ) : (
          <>
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="max-sm:hidden rounded-full"
            >
              Sign up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
