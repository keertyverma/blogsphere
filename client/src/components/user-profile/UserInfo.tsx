import { useAuthContext } from "@/context/authContext";
import { useGetUser } from "@/lib/react-query/queries";
import { formatDate, formateNumber } from "@/lib/utils";
import { LuCalendarDays } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import UserListSkeleton from "../search/UserListSkeleton";
import { Button } from "../ui/button";
import SocialLinks from "./SocialLinks";

interface Props {
  profileId: string;
}
const UserInfo = ({ profileId }: Props) => {
  const navigate = useNavigate();
  const {
    user: { username },
  } = useAuthContext();

  const { data: user, isLoading, error } = useGetUser(profileId);

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
        <div className="text-center p-3 rounded-full bg-muted mt-10">
          <p>No user available</p>
        </div>
      </section>
    );

  const {
    personalInfo: { fullname, profileImage, bio },
    accountInfo: { totalPosts, totalReads },
    createdAt,
    socialLinks,
  } = user;

  return (
    <div className="border-b border-border md:border-b-0 md:border-l min-w-[250px] md:min-w-[350px] md:px-4">
      <div className="flex gap-3">
        <img
          src={profileImage}
          className="w-28 h-2w-28 object-cover rounded-full border-2 border-border"
        />
        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-semibold capitalize line-clamp-2">
            {fullname}
          </h1>
          <p className="text-muted-foreground leading-5 line-clamp-2 md:line-clamp-3 max-w-[250px]">
            {bio}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold">{formateNumber(totalPosts)}</span>{" "}
            Posts |{" "}
            <span className="font-semibold">{formateNumber(totalReads)}</span>{" "}
            Reads
          </p>
        </div>
      </div>
      <div className="flex justify-between my-4">
        <div>
          <p className="text-sm text-muted-foreground flex-center gap-2">
            <LuCalendarDays />
            Joined on {formatDate(createdAt)}
          </p>
          <SocialLinks links={socialLinks} />
        </div>
        {profileId === username && (
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => navigate("/settings/edit-profile")}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
