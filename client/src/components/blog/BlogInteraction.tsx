import { useAuthContext } from "@/context/authContext";
import { useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked, formateNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import ManageBlog from "./ManageBlog";

interface Props {
  blogId: string;
  authorUsername: string;
  likes?: { [key: string]: boolean };
}

const BlogInteraction = ({ blogId, authorUsername, likes }: Props) => {
  const [blogLikes, setBlogLikes] = useState<{ [key: string]: boolean }>({});
  const { user, isAuthenticated, token } = useAuthContext();
  const { mutateAsync: likePost } = useLikePost();
  const navigate = useNavigate();

  useEffect(() => {
    if (likes) {
      setBlogLikes(likes);
    }
  }, [likes]);

  const handlePostLikeUnlike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to like this blog");
      return navigate("/login");
    }

    // update like count in UI
    setBlogLikes((prevLikes) => {
      const likeObj = { ...prevLikes };
      if (checkIsLiked(likeObj, user.id)) {
        // unlike
        delete likeObj[user.id];
      } else {
        // like
        likeObj[user.id] = true;
      }
      return likeObj;
    });

    // update like count in backend server
    await likePost({ token, blogId });
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
            onClick={handlePostLikeUnlike}
            aria-label="like this blog"
          >
            {checkIsLiked(blogLikes, user.id) ? (
              <FaHeart className="text-red-600 hover:text-red-500 like-animation" />
            ) : (
              <FaRegHeart />
            )}
          </Button>
          {Object.keys(blogLikes).length > 0 && (
            <p className="text-sm">
              {formateNumber(Object.keys(blogLikes).length)}
            </p>
          )}
        </div>
        {user.username === authorUsername && <ManageBlog blogId={blogId} />}
      </div>
      <hr className="border-border my-1" />
    </>
  );
};

export default BlogInteraction;
