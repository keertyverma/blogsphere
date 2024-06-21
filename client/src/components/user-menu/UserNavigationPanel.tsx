import { useAuthContext } from "@/context/authContext";
import { useGetUser } from "@/lib/react-query/queries";
import { IUser } from "@/types";
import { IoSettingsOutline } from "react-icons/io5";
import { LuUserCircle } from "react-icons/lu";
import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import AnimationWrapper from "../shared/AnimationWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";

const UserNavigationPanel = () => {
  const {
    user: { username },
    setUserAndToken,
    setIsAuthenticated,
  } = useAuthContext();
  const { data: user, isLoading, error } = useGetUser(username);

  const logoutUser = () => {
    setUserAndToken({} as IUser, "");
    setIsAuthenticated(false);
  };

  if (error) console.error(error);
  if (isLoading) return <LoadingSpinner />;

  return (
    <AnimationWrapper transition={{ duration: 0.2 }}>
      <Menubar className="w-10 h-10 rounded-full flex-center">
        <MenubarMenu>
          <MenubarTrigger className="focus:bg-transparent data-[state=open]:bg-transparent">
            <div className="w-10 h-10 rounded-full border-b border-border shadow-md cursor-pointer">
              <img
                src={user?.personalInfo.profileImage}
                alt={"profile image"}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <div className="flex gap-3 p-1">
                <div className="w-10 h-10 rounded-full shadow-lg">
                  <img
                    src={user?.personalInfo.profileImage}
                    alt={"profile image"}
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-bold capitalize">
                    {user?.personalInfo.fullname}
                  </h2>
                  <p className="font-medium text-muted-foreground">
                    @{username}
                  </p>
                </div>
              </div>
            </MenubarItem>
            <MenubarSeparator />
            <Link to={`/user/${username}`} className="text-muted-foreground">
              <MenubarItem>
                <LuUserCircle className="text-lg mr-2" /> Profile
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
