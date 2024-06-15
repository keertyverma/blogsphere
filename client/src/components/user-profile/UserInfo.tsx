import { useAuthContext } from "@/context/authContext";
import { formatDate, formateNumber } from "@/lib/utils";
import { IAuthor } from "@/types";
import { LuCalendarDays } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import SocialLinks from "./SocialLinks";

interface Props {
  profileId: string;
  user: IAuthor;
}
const UserInfo = ({ profileId, user }: Props) => {
  const navigate = useNavigate();
  const {
    user: { username },
  } = useAuthContext();

  const {
    personalInfo: { fullname, profileImage, bio },
    accountInfo: { totalPosts, totalReads },
    createdAt,
    socialLinks,
  } = user;

  return (
    <div className="w-full md:w-[70%] md:px-4 max-sm:border-b border-border">
      <div className="flex gap-3">
        <img
          src={profileImage}
          className="w-28 h-28 object-cover rounded-full border-2 border-border"
        />
        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-semibold capitalize line-clamp-2">
            {fullname}
          </h1>
          <p className="text-muted-foreground leading-5 line-clamp-2 md:line-clamp-3">
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
