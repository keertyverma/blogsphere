import { useAuthContext } from "@/context/authContext";
import { useState } from "react";
import { BsPencilSquare } from "react-icons/bs";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineLock } from "react-icons/md";
import { NavLink, Navigate, Outlet } from "react-router-dom";

const SideNavbar = () => {
  const { isAuthenticated } = useAuthContext();
  const [pageUrl, setPageUrl] = useState("");

  if (!isAuthenticated) return <Navigate to="/login" />;

  console.log("pageUrl = ", pageUrl);

  return (
    <section className="relative flex max-md:flex-col gap-10 py-0 pt-20 m-0 ">
      {/* Side Navigation Bar */}
      <div className="sticky top-[80px] z-30">
        <div className="min-w-[200px] md:sticky top-24 overflow-y-auto p-6 md:pr-0 ">
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
            <HiOutlineUserCircle className="text-xl" /> Edit Profile
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
      <div className="max-md:-mt-8 mt-5 w-full">
        <Outlet />
      </div>
    </section>
  );
};

export default SideNavbar;
