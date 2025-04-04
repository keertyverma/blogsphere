import { useGetSearchedUsers } from "@/lib/react-query/queries";
import { Link } from "react-router-dom";
import AnimationWrapper from "../shared/AnimationWrapper";
import UserListSkeleton from "./UserListSkeleton";
import { handleProfileImgErr } from "@/lib/utils";

interface Props {
  searchTerm: string;
}

const SearchedUserList = ({ searchTerm }: Props) => {
  const { data: users, isLoading, error } = useGetSearchedUsers(searchTerm);

  if (isLoading) return <UserListSkeleton />;

  if (error) console.error(error);

  if (!users?.length)
    return (
      <div className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
        <p>No users found.</p>
        <p>Try a different name.</p>
      </div>
    );

  return users.map((user, index) => (
    <AnimationWrapper
      key={index}
      transition={{ duration: 1, delay: index * 0.1 }}
    >
      <Link
        to={`/user/${user.personalInfo.username}`}
        className="flex gap-3 items-center border-b border-border p-4 hover:bg-muted/50"
      >
        <div className="min-w-9">
          <img
            src={user.personalInfo.profileImage}
            alt="user profile image"
            className="w-9 h-9 object-cover rounded-full border-[1px] border-border"
            onError={handleProfileImgErr}
          />
        </div>

        <div className="flex-col tracking-tight">
          <p className="text-base text-secondary-foreground font-semibold capitalize line-clamp-2">
            {user.personalInfo.fullname}
          </p>
          <p className="text-sm text-muted-foreground font-normal">
            {`@${user.personalInfo.username}`}
          </p>
          {user.personalInfo.bio && (
            <p className="text-sm text-muted-foreground font-normal line-clamp-1">
              {user.personalInfo.bio}
            </p>
          )}
        </div>
      </Link>
    </AnimationWrapper>
  ));
};

export default SearchedUserList;
