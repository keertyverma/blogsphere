import UserListSkeleton from "@/components/search/UserListSkeleton";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import UserBlogList from "@/components/user-profile/UserBlogList";
import UserInfo from "@/components/user-profile/UserInfo";
import { useGetUser } from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

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
      <section className="h-cover flex flex-col md:flex-row-reverse gap-5 lg:gap-10 py-24">
        {/* user info */}
        {profileId && <UserInfo profileId={profileId} user={user} />}

        {/* user published blogs */}
        <div className="w-full">
          <InPageNavigation routes={["Blogs"]}>
            <UserBlogList authorId={user._id} />
          </InPageNavigation>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default UserProfile;
