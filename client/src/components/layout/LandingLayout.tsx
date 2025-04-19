import { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LandingNavbar from "../navbars/LandingNavbar";
import Footer from "../shared/Footer";

interface LandingLayoutProps {
  children?: ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  const location = useLocation();
  const showFooter = ["/", "/privacy-policy"].includes(location.pathname);

  return (
    <>
      <header>
        <LandingNavbar />
      </header>
      {children ? children : <Outlet />}
      {showFooter && <Footer />}
    </>
  );
};

export default LandingLayout;
