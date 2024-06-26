import { useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked, formateNumber } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IAuthor } from "@/types";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import BlogComment from "./BlogComment";
import ManageBlog from "./ManageBlog";

interface Props {
  id?: string;
  blogId: string;
  author: IAuthor;
  likes?: { [key: string]: boolean };
  activity?: {
    totalReads: number;
    totalParentComments: number;
  };
}

const BlogInteraction = ({ id, blogId, author, likes, activity }: Props) => {
  const [blogLikes, setBlogLikes] = useState<{ [key: string]: boolean }>({});
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { mutateAsync: likePost } = useLikePost();
  const navigate = useNavigate();

  useEffect(() => {
    if (likes) {
      setBlogLikes(likes);
    }
  }, [likes]);

  const {
    _id: authorId,
    personalInfo: { username: authorUsername },
  } = author;

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
        <div className="flex-center gap-2 text-muted-foreground hover:text-slate-600">
          <div className="flex-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="text-lg p-1 pl-0 bg-transparent hover:bg-transparent text-inherit"
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
          <div className="flex-center">
            <BlogComment
              blogId={id}
              authorId={authorId}
              totalParentComments={activity?.totalParentComments}
            />
            {activity && activity.totalParentComments !== 0 ? (
              <p className="text-sm mr-1">
                {formateNumber(activity.totalParentComments)}
              </p>
            ) : null}
          </div>

          {user.username === authorUsername && (
            <div className="flex-center gap-1">
              <MdOutlineRemoveRedEye className="text-lg" />
              {activity && activity.totalReads !== 0 ? (
                <p className="text-sm">{formateNumber(activity.totalReads)}</p>
              ) : null}
            </div>
          )}
        </div>
        {user.username === authorUsername && <ManageBlog blogId={blogId} />}
      </div>
      <hr className="border-border my-1" />
    </>
  );
};

export default BlogInteraction;
