import { useAuthContext } from "@/context/authContext";
import { formateNumber } from "@/lib/utils";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface Props {
  blogId: string;
  authorUsername: string;
  totalLikes?: number;
}

const BlogInteraction = ({ blogId, authorUsername, totalLikes }: Props) => {
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handlePostLike = () => {
    // TODO: call api and update post like count in backend
    setIsLikedByUser((prev) => !prev);
  };

  return (
    <>
      <hr className="border-border my-1" />
      <div className="flex flex-row justify-between items-center">
        <div className="flex-center gap-2 px-2 text-muted-foreground hover:text-slate-600">
          <Button
            variant="secondary"
            size="sm"
            className="text-lg px-0 bg-transparent hover:bg-transparent text-inherit"
            onClick={handlePostLike}
            aria-label="like this blog"
          >
            {isLikedByUser ? (
              <FaHeart className="text-red-600 hover:text-red-500 like-animation" />
            ) : (
              <FaRegHeart />
            )}
          </Button>
          {totalLikes && totalLikes > 0 && (
            <p className="text-sm">{formateNumber(totalLikes)}</p>
          )}
        </div>

        {user.username === authorUsername && (
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => navigate(`/editor/${blogId}`)}
          >
            Edit
          </Button>
        )}
      </div>
      <hr className="border-border my-1" />
    </>
  );
};

export default BlogInteraction;
