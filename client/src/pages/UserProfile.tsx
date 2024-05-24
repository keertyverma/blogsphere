import AnimationWrapper from "@/components/shared/AnimationWrapper";
import UserInfo from "@/components/user-profile/UserInfo";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { username: profileId } = useParams();

  return (
    <AnimationWrapper>
      <section className="h-cover flex flex-col md:flex-row-reverse gap-5 lg:gap-10 py-24">
        {/* user info */}
        {profileId && <UserInfo profileId={profileId} />}

        {/* user published blogs */}
      </section>
    </AnimationWrapper>
  );
};

export default UserProfile;
