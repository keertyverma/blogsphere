import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // check for saved user preference
    const savedTheme = localStorage.getItem("BlogsphereTheme");
    return savedTheme === "dark" ? "dark" : "light";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // add or remove dark theme class to root element
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setIsTransitioning(true);

    setTimeout(() => {
      setTheme((prevTheme) => {
        const newTheme = prevTheme === "dark" ? "light" : "dark";
        localStorage.setItem("BlogsphereTheme", newTheme);
        return newTheme;
      });
      // Wait for the overlay fade-out animation (400ms) to complete before ending the transition
      setTimeout(() => setIsTransitioning(false), 400);
    }, 50);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("'useTheme' must be used within a ThemeProvider");
  }
  return context;
};
