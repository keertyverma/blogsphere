import { useAuthContext } from "@/context/authContext";
import { useEffect, useRef, useState } from "react";
import { BsLayoutTextSidebarReverse, BsPencilSquare } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineLock } from "react-icons/md";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { Button } from "../ui/button";

const SideNavbar = () => {
  const { isAuthenticated } = useAuthContext();

  const page = location.pathname.split("/")[2];
  const [pageUrl, setPageUrl] = useState(page.replace("-", " "));

  const [showSideNav, setShowSideNav] = useState(false);
  const activeTabLineRef = useRef<HTMLHRElement>(null);
  const sideBarIconRef = useRef<HTMLButtonElement>(null);
  const pageStateRef = useRef<HTMLButtonElement>(null);

  const changePageState = (btn: HTMLButtonElement) => {
    if (activeTabLineRef && activeTabLineRef.current) {
      const { offsetWidth, offsetLeft } = btn;
      activeTabLineRef.current.style.width = `${offsetWidth}px`;
      activeTabLineRef.current.style.left = `${offsetLeft}px`;
    }

    if (btn === sideBarIconRef.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateRef?.current?.click();
  }, [pageUrl]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <section className="relative flex max-md:flex-col gap-10 py-0 pt-20 m-0 ">
      {/* Side Navigation Bar */}
      <div className="sticky top-[80px] z-30">
        {/* Mobile screens side nav buttons*/}
        <div className="md:hidden bg-white py-1 border-b border-border flex flex-nowrap overflow-x-auto">
          <Button
            ref={sideBarIconRef}
            variant="secondary"
            size="icon"
            className="bg-transparent hover:bg-transparent"
            onClick={(e) => {
              changePageState(e.target as HTMLButtonElement);
            }}
          >
            <BsLayoutTextSidebarReverse className="text-xl md:text-lg text-muted-foreground pointer-events-none" />
          </Button>
          <Button
            ref={pageStateRef}
            variant="secondary"
            className="capitalize text-secondary-foreground bg-transparent hover:bg-transparent"
            onClick={(e) => {
              changePageState(e.target as HTMLButtonElement);
            }}
          >
            {pageUrl}
          </Button>
          <hr
            ref={activeTabLineRef}
            className="absolute bottom-0 duration-500 bg-accent-foreground h-[2px]"
          />
        </div>
        <div
          className={
            "min-w-[200px] h-[calc(100vh-70px-60px)] md:h-cover absolute md:sticky top-24 max-md:top-[64px] overflow-y-auto p-6 md:pr-0 md:border-border md:border-r bg-white max-md:w-[calc(100%+80px)] max-md:px-14 max-md:-ml-7 duration-400 " +
            (showSideNav
              ? "opacity-100 pointer-events-auto"
              : "max-md:opacity-0 max-md:pointer-events-none")
          }
        >
          {/* Dashboard */}
          <h1 className="text-base md:text-lg text-slate-900 mb-3">
            Dashboard
          </h1>
          <hr className="border-border mb-5 -ml-6 mr-6" />
          <NavLink
            to="/editor"
            onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
              setPageUrl((e.target as HTMLAnchorElement).innerText)
            }
            className="sidebar-link"
          >
            <BsPencilSquare className="text-lg" /> Write
          </NavLink>
          <NavLink
            to="/dashboard/blogs"
            onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
              setPageUrl((e.target as HTMLAnchorElement).innerText)
            }
            className="sidebar-link"
          >
            <IoDocumentTextOutline className="text-xl" /> Manage Blogs
          </NavLink>

          {/* Setting */}
          <h1 className="text-base md:text-lg text-slate-900 mb-3 mt-10">
            Setting
          </h1>
          <hr className="border-border mb-5 -ml-6 mr-6" />
          <NavLink
            to="/settings/edit-profile"
            onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
              setPageUrl((e.target as HTMLAnchorElement).innerText)
            }
            className="sidebar-link"
          >
            <FaRegUserCircle className="text-xl" /> Edit Profile
          </NavLink>
          <NavLink
            to="/settings/change-password"
            onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
              setPageUrl((e.target as HTMLAnchorElement).innerText)
            }
            className="sidebar-link"
          >
            <MdOutlineLock className="text-xl" /> Change Password
          </NavLink>
        </div>
      </div>
      <div className="max-md:-mt-7 mt-5 w-full">
        <Outlet />
      </div>
    </section>
  );
};

export default SideNavbar;
