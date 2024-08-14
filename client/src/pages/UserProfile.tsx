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
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { username: profileId } = useParams();
  const { data: user, isLoading, error } = useGetUser(profileId);
  const authUser = useAuthStore((s) => s.user);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Clear search input and term when user changes to prevent using outdated queries.
    setSearchInput("");
    setSearchTerm("");
  }, [profileId]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchInput(input);

    // Reset search term if input is cleared
    if (input.length === 0) {
      setSearchTerm("");
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update the search term when Enter is pressed, provided the search input is not empty.
    if (e.key === "Enter" && searchInput.length > 0) {
      setSearchTerm(searchInput);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  return (
    <AnimationWrapper>
      <div className="h-cover px-0 md:px-10">
        <section className="px-6 mx-auto md:max-w-[728px] flex flex-col gap-5 py-24">
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
              onChange={handleChange}
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
