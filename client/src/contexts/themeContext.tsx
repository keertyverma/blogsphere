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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // check for saved user preference
    const savedTheme = localStorage.getItem("BlogsphereTheme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    // add or remove dark theme class to root element
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("BlogsphereTheme", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
