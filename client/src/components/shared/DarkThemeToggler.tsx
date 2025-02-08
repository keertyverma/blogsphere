import { useTheme } from "@/contexts/themeContext";
import { cn } from "@/lib/utils";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Button } from "../ui/button";

interface DarkThemeTogglerProps {
  classname?: string;
}

const DarkThemeToggler = ({ classname }: DarkThemeTogglerProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 p-0 bg-muted rounded-full flex-center border border-transparent hover:border hover:border-muted-foreground/40",
        classname
      )}
    >
      {theme === "dark" ? (
        <MdOutlineLightMode className="text-muted-foreground text-xl" />
      ) : (
        <MdOutlineDarkMode className="text-muted-foreground text-xl" />
      )}
    </Button>
  );
};

export default DarkThemeToggler;
