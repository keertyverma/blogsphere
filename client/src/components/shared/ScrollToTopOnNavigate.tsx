import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top whenever the route changes
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTopOnNavigate;
