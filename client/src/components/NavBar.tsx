import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/AuthProvider";
import { useState } from "react";
import { BsBell, BsPencilSquare, BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import UserNavigationPanel from "./UserNavigationPanel";

const NavBar = () => {
  const [toggleSearch, setToggleSearch] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="navbar">
      <Logo />
      <div
        className={`absolute md:relative left-0 top-full md:inset-0 w-full md:w-auto mt-0.5  py-4 px-[7vw] md:block md:p-0 md:show ${
          toggleSearch ? "show" : "hide"
        }`}
      >
        <BsSearch className="absolute left-[10%] md:left-5 top-1/2 md:pointer-events-none -translate-y-1/2 text-l text-muted-foreground" />
        <Input
          className="bg-accent pl-12 placeholder:text-muted-foreground text-accent-foreground rounded-full focus-visible:ring-1"
          placeholder="Search"
        />
      </div>
      <div className="flex items-center gap-1 md:gap-4 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setToggleSearch((prev) => !prev)}
          className="md:hidden bg-accent rounded-full flex-center"
        >
          <BsSearch className="text-l text-muted-foreground" />
        </Button>

        <Button
          onClick={() => navigate("/editor")}
          className="sm:flex-center max-sm:hidden rounded-full gap-2 ml-2"
        >
          <BsPencilSquare className="text-l" />
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
