import { useGetUser, useLogout } from "@/lib/react-query/queries";
import { handleProfileImgErr } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IoBookmarksOutline, IoSettingsOutline } from "react-icons/io5";
import { LuUserCircle } from "react-icons/lu";
import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AnimationWrapper from "../shared/AnimationWrapper";
import { Button } from "../ui/button";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";

const UserNavigationPanel = () => {
  const authUser = useAuthStore((s) => s.user);
  const clearUserAuth = useAuthStore((s) => s.clearUserAuth);
  const { data: user, isLoading, error } = useGetUser(authUser.username);
  const { mutateAsync: logout } = useLogout();

  const logoutUser = async () => {
    try {
      await logout();
      clearUserAuth();
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        const errorMessage = "An error occurred. Please try again later.";
        toast.error(errorMessage);
      }
    }
  };

  if (error) console.error(error);
  if (isLoading) return <LoadingSpinner />;

  // Fallback profile image URL
  const profileImageUrl =
    user?.personalInfo.profileImage || "/assets/images/default_profile.png";

  return (
    <AnimationWrapper transition={{ duration: 0.2 }}>
      <Menubar className="w-10 h-10 rounded-full flex-center">
        <MenubarMenu>
          <MenubarTrigger className="focus:bg-transparent data-[state=open]:bg-transparent">
            <div className="w-10 h-10 rounded-full border border-transparent hover:border hover:border-muted-foreground/40 shadow-md cursor-pointer">
              <img
                src={profileImageUrl}
                alt="profile image"
                className="object-cover w-full h-full rounded-full"
                onError={handleProfileImgErr}
              />
            </div>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <div className="flex gap-3 p-1">
                <div className="w-10 h-10 rounded-full shadow-lg">
                  <img
                    src={profileImageUrl}
                    alt={"profile image"}
                    className="object-cover w-full h-full rounded-full"
                    onError={handleProfileImgErr}
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-bold capitalize">
                    {user?.personalInfo.fullname}
                  </h2>
                  <p className="font-medium text-muted-foreground">
                    @{authUser.username}
                  </p>
                </div>
              </div>
            </MenubarItem>
            <MenubarSeparator />
            <Link
              to={`/user/${authUser.username}`}
              className="text-muted-foreground"
            >
              <MenubarItem>
                <LuUserCircle className="text-lg mr-2" /> Profile
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <Link to="/bookmarks" className="text-muted-foreground">
              <MenubarItem>
                <IoBookmarksOutline className="text-lg mr-2" /> Bookmarks
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <Link to="/settings/edit-profile" className="text-muted-foreground">
              <MenubarItem>
                <IoSettingsOutline className="text-lg mr-2" /> Account settings
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <MenubarItem className="py-0" onClick={() => logoutUser()}>
              <Button
                variant="secondary"
                size="sm"
                className="text-orange-800 p-0 bg-transparent font-medium"
              >
                <MdLogout className="text-lg mr-2 text-orange-800/90" /> Log out
              </Button>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
