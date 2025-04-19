import { Outlet } from "react-router-dom";
import HomeNavbar from "../navbars/HomeNavbar";

const HomeLayout = () => {
  return (
    <>
      <HomeNavbar />
      <Outlet />
    </>
  );
};

export default HomeLayout;
