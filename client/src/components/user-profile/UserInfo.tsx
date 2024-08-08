import { formatDate, formateNumber, handleProfileImgErr } from "@/lib/utils";
import { useAuthStore } from "@/store";
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
  const authUser = useAuthStore((s) => s.user);

  const {
    personalInfo: { fullname, profileImage, bio },
    accountInfo: { totalPosts, totalReads },
    createdAt,
    socialLinks,
  } = user;

  return (
    <div className="w-full md:w-[80%] md:px-4">
      <div className="flex gap-3">
        <div className="min-w-28">
          <img
            src={profileImage}
            className="w-28 h-28 object-cover rounded-full border-2 border-border"
            onError={handleProfileImgErr}
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-semibold capitalize">{fullname}</h1>
          <p className="text-muted-foreground leading-5">{bio}</p>
          <div className="text-sm text-secondary-foreground mt-1 flex gap-1">
            <p>
              <span className="font-semibold mr-1">
                {formateNumber(totalPosts)}
              </span>
              Blogs
            </p>
            {totalReads > 0 && (
              <>
                <span>|</span>
                <p>
                  <span className="font-semibold mr-1">
                    {formateNumber(totalReads)}
                  </span>
                  Views
                </p>
              </>
            )}
          </div>
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
        {profileId === authUser.username && (
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
