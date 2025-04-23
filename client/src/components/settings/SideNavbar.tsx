import { useAuthStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { BsLayoutTextSidebarReverse } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import { IoIosAt } from "react-icons/io";
import { MdOutlineLock } from "react-icons/md";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../ui/button";

const SideNavbar = () => {
  const { googleAuth } = useAuthStore((s) => s.user);

  const page = location.pathname.split("/")[2];
  const [pageUrl, setPageUrl] = useState(page?.replace("-", " ") || "");

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

  return (
    <section className="relative flex max-md:flex-col gap-10 py-0 pt-20 m-0">
      {/* Side Navigation Bar */}
      <div className="sticky top-[var(--header-height)] z-40">
        {/* Mobile screens side nav buttons*/}
        <div className="md:hidden py-1 border-b border-border flex flex-nowrap overflow-x-auto bg-background">
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
            className="capitalize text-secondary-foreground bg-transparent hover:bg-transparent text-base"
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
            "min-w-[200px] h-[calc(100vh-var(--header-height)-60px)] md:h-cover absolute md:sticky top-24 max-md:top-12 overflow-y-auto max-md:p-6 md:border-border md:border-r max-md:w-[calc(100%+80px)] max-md:px-14 max-md:-ml-7 duration-400 bg-background " +
            (showSideNav
              ? "opacity-100 pointer-events-auto"
              : "max-md:opacity-0 max-md:pointer-events-none")
          }
        >
          {/* Settings */}
          <h1 className="text-base md:text-lg mb-2">User Settings</h1>
          <hr className="border-border mb-2 -ml-6" />
          <NavLink
            to="/settings/edit-profile"
            onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
              setPageUrl((e.target as HTMLAnchorElement).innerText)
            }
            className="sidebar-link"
          >
            <FaRegUserCircle className="text-xl" /> Edit Profile
          </NavLink>
          {!googleAuth && (
            <NavLink
              to="/settings/change-password"
              onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
                setPageUrl((e.target as HTMLAnchorElement).innerText)
              }
              className="sidebar-link"
            >
              <MdOutlineLock className="text-xl" /> Change Password
            </NavLink>
          )}
          <NavLink
            to="/settings/change-username"
            onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
              setPageUrl((e.target as HTMLAnchorElement).innerText)
            }
            className="sidebar-link !gap-3"
          >
            <IoIosAt className="text-2xl" />
            Change Username
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
