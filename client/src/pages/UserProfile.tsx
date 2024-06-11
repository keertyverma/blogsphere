import UserListSkeleton from "@/components/search/UserListSkeleton";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import UserPublishedBlogList from "@/components/user-profile/UserPublishedBlogList";
import UserInfo from "@/components/user-profile/UserInfo";
import { useGetUser } from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";
import UserDraftBlogList from "@/components/user-profile/UserDraftBlogList";

const UserProfile = () => {
  const { username: profileId } = useParams();
  const { data: user, isLoading, error } = useGetUser(profileId || "");

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

  return (
    <AnimationWrapper>
      <div className="h-cover px-0 md:px-10">
        <section className="px-4 mx-auto md:max-w-[728px] flex flex-col gap-5 py-24">
          {/* user info */}
          {profileId && <UserInfo profileId={profileId} user={user} />}

          {/* user published blogs */}
          <div className="w-full">
            <InPageNavigation routes={["Published", "Draft"]}>
              <UserPublishedBlogList authorId={user._id} />
              <UserDraftBlogList authorId={user._id} />
            </InPageNavigation>
          </div>
        </section>
      </div>
    </AnimationWrapper>
  );
};

export default UserProfile;
