import { useAuthContext } from "@/context/AuthProvider";
import { IUser } from "@/types";
import { Link } from "react-router-dom";
import AnimationWrapper from "./AnimationWrapper";
import { Button } from "./ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "./ui/menubar";

const UserNavigationPanel = () => {
  const {
    user: { fullname, username, profileImage },
    setUserAndToken,
    setIsAuthenticated,
  } = useAuthContext();

  const logoutUser = () => {
    localStorage.removeItem("blogsphere_user");
    setUserAndToken({} as IUser, "");
    setIsAuthenticated(false);
  };

  return (
    <AnimationWrapper transition={{ duration: 0.2 }}>
      <Menubar className="w-10 h-10 rounded-full flex-center">
        <MenubarMenu>
          <MenubarTrigger>
            <div className="w-10 h-10 rounded-full border-b border-border shadow-md">
              <img
                src={profileImage}
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
                    src={profileImage}
                    alt={"profile image"}
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-bold capitalize">{fullname}</h2>
                  <p className="font-medium text-muted-foreground">
                    @{username}
                  </p>
                </div>
              </div>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <Link to={`/user/${username}`} className="text-muted-foreground">
                Profile
              </Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <Link to="/dashboard/blogs" className="text-muted-foreground">
                Dashboard
              </Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <Link
                to="/settings/edit-profile"
                className="text-muted-foreground"
              >
                Settings
              </Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="py-0">
              <Button
                onClick={() => logoutUser()}
                variant="secondary"
                size="sm"
                className="text-orange-800 p-0 bg-transparent font-medium"
              >
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
