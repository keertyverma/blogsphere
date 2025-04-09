import { useGetUser, useLogout } from "@/lib/react-query/queries";
import {
  clearBlogReadTimestamps,
  handleProfileImgErr,
  showErrorToast,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { FaRegCircleUser } from "react-icons/fa6";
import {
  IoBookmarksOutline,
  IoReaderOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
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
  const setRedirectedUrl = useAuthStore((s) => s.setRedirectedUrl);
  const { data: user, isLoading, error } = useGetUser(authUser.username);
  const { mutateAsync: logout } = useLogout();
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      await logout();
      clearUserAuth();
      clearBlogReadTimestamps(); // clear blog read tracking timestamp
      setRedirectedUrl(null);
      return navigate("/");
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
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
          <MenubarContent className="px-0 max-w-[250px]">
            <MenubarItem className="pointer-events-none focus:bg-background  hover:dark:bg-background">
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
                  <h2 className="font-bold capitalize max-w-[200px]">
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
              <MenubarItem className="focus:dark:bg-background hover:dark:bg-background">
                <FaRegCircleUser className="text-lg mr-2" /> Profile
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <Link to="/bookmarks" className="text-muted-foreground">
              <MenubarItem className="focus:dark:bg-background hover:dark:bg-background">
                <IoBookmarksOutline className="text-lg mr-2" /> Bookmarks
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <Link to="/settings/edit-profile" className="text-muted-foreground">
              <MenubarItem className="focus:dark:bg-background hover:dark:bg-background">
                <IoSettingsOutline className="text-lg mr-2" /> Account Settings
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <Link to="/editor-guide" className="text-muted-foreground">
              <MenubarItem className="focus:dark:bg-background hover:dark:bg-background">
                <IoReaderOutline className="text-lg mr-2" /> Editor Guide
              </MenubarItem>
            </Link>
            <MenubarSeparator />
            <MenubarItem
              className="py-0 focus:dark:bg-background hover:dark:bg-background"
              onClick={() => logoutUser()}
            >
              <Button
                variant="secondary"
                size="sm"
                className="text-orange-800 dark:text-destructive/90 p-0 bg-transparent hover:bg-transparent font-medium"
              >
                <MdLogout className="text-lg mr-2 text-orange-800/90 dark:text-destructive/90" />{" "}
                Log out
              </Button>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
