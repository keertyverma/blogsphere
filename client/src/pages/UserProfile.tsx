import UserListSkeleton from "@/components/search/UserListSkeleton";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDraftBlogList from "@/components/user-profile/UserDraftBlogList";
import UserInfo from "@/components/user-profile/UserInfo";
import UserPublishedBlogList from "@/components/user-profile/UserPublishedBlogList";
import { useGetUser } from "@/lib/react-query/queries";
import { useAuthStore } from "@/store";
import { KeyboardEvent, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { username: profileId } = useParams();
  const { data: user, isLoading, error } = useGetUser(profileId);
  const authUser = useAuthStore((s) => s.user);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <section>
        <UserListSkeleton count={1} />
      </section>
    );

  if (error) console.error(error);

  if (!user)
    return (
      <section>
        <div className="w-[50%] text-center p-3 rounded-full bg-muted mt-10">
          <p>No user available</p>
        </div>
      </section>
    );

  const routes = ["Published Blogs"];
  if (authUser.username === user.personalInfo.username) routes.push("Drafts");

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const query = input.value;

    if (e.key === "Enter" && query.length) {
      setSearchTerm(query);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  return (
    <AnimationWrapper>
      <div className="h-cover px-0 md:px-10">
        <section className="px-4 mx-auto md:max-w-[728px] flex flex-col gap-5 py-24">
          {/* user info */}
          {profileId && <UserInfo profileId={profileId} user={user} />}
          <hr />

          {/* search input box */}
          <div className="relative w-full mx-auto md:p-0">
            <BsSearch className="absolute left-[5%] md:left-5 top-1/2 md:pointer-events-none -translate-y-1/2 text-muted-foreground" />
            <Input
              className="bg-accent pl-12 placeholder:text-muted-foreground text-accent-foreground rounded-full focus-visible:ring-1"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-[5%] md:right-5 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={handleClear}
              >
                <IoClose />
              </Button>
            )}
          </div>

          {/* user published blogs */}
          <div className="w-full">
            <InPageNavigation routes={routes}>
              <UserPublishedBlogList
                authorId={user._id}
                searchTerm={searchTerm}
              />

              {authUser.username === user.personalInfo.username && (
                <UserDraftBlogList
                  authorId={user._id}
                  searchTerm={searchTerm}
                />
              )}
            </InPageNavigation>
          </div>
        </section>
      </div>
    </AnimationWrapper>
  );
};

export default UserProfile;
