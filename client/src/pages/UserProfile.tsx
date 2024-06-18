import UserListSkeleton from "@/components/search/UserListSkeleton";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import UserDraftBlogList from "@/components/user-profile/UserDraftBlogList";
import UserInfo from "@/components/user-profile/UserInfo";
import UserPublishedBlogList from "@/components/user-profile/UserPublishedBlogList";
import { useAuthContext } from "@/context/authContext";
import { useGetUser } from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { username: profileId } = useParams();
  const { data: user, isLoading, error } = useGetUser(profileId);
  const { user: authUser } = useAuthContext();

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

  return (
    <AnimationWrapper>
      <div className="h-cover px-0 md:px-10">
        <section className="px-4 mx-auto md:max-w-[728px] flex flex-col gap-5 py-24">
          {/* user info */}
          {profileId && <UserInfo profileId={profileId} user={user} />}

          {/* user published blogs */}
          <div className="w-full">
            <InPageNavigation routes={routes}>
              <UserPublishedBlogList authorId={user._id} />

              {authUser.username === user.personalInfo.username && (
                <UserDraftBlogList authorId={user._id} />
              )}
            </InPageNavigation>
          </div>
        </section>
      </div>
    </AnimationWrapper>
  );
};

export default UserProfile;
