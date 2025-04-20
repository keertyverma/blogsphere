import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import {
  useBookmarkStatus,
  useCreateBookmark,
  useDeleteBookmark,
  useLikePost,
} from "@/lib/react-query/queries";
import {
  checkIsLiked,
  formateNumber,
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IAuthor } from "@/types";
import { useEffect, useState } from "react";
import { FaBookmark, FaHeart, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import LoginPromptModal from "../shared/LoginPromptModal";
import { Button } from "../ui/button";
import BlogComment from "./BlogComment";
import ManageBlog from "./ManageBlog";
import ShareBlog from "./ShareBlog";

interface Props {
  id?: string;
  blogId: string;
  title: string;
  author: IAuthor;
  likes?: { [key: string]: boolean };
  activity?: {
    totalReads: number;
    totalComments: number;
  };
  isDraft?: boolean;
  description: string;
  tags?: string[];
}

const BlogInteraction = ({
  id,
  blogId,
  title,
  author,
  likes,
  activity,
  isDraft = false,
  description,
  tags = [],
}: Props) => {
  const [blogLikes, setBlogLikes] = useState<{ [key: string]: boolean }>(
    likes || {}
  );
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const { mutateAsync: likePost } = useLikePost();
  const { mutateAsync: createBookmark } = useCreateBookmark();
  const { mutateAsync: deleteBookmark } = useDeleteBookmark();
  const { data: bookmarkStatus, isLoading: isCheckingBookmarkStatus } =
    useBookmarkStatus(user.id, id);
  const {
    showLoginPrompt,
    loginPromptTitle,
    loginPromptMessage,
    promptLoginFor,
    handlePromptConfirm,
    handlePromptCancel,
  } = useLoginPrompt();

  useEffect(() => {
    // Sync state with API result (Only when fetching completes)
    if (!isCheckingBookmarkStatus && bookmarkStatus) {
      setIsBookmarked(bookmarkStatus?.exists ?? false);
    }
  }, [isCheckingBookmarkStatus, bookmarkStatus]);

  const handlePostLikeUnlike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      return promptLoginFor("like");
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

    // update like count
    await likePost(blogId);
  };

  const handleBookmark = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      return promptLoginFor("bookmark");
    }

    try {
      if (isBookmarked) {
        // remove bookmark
        setIsBookmarked(false);
        await deleteBookmark(id as string);
        showSuccessToast("Blog unsaved");
      } else {
        // add bookmark
        setIsBookmarked(true);
        await createBookmark(id as string);
        showSuccessToast(
          <div className="flex-center space-x-4">
            <span>Blog saved</span>
            <Button
              variant="outline"
              className="rounded-full hover:bg-input focus:bg-input active:bg-input"
              onClick={() => navigate("/bookmarks")}
            >
              View
            </Button>
          </div>
        );
      }
    } catch (error) {
      setIsBookmarked((prev: boolean) => !prev); // Revert state on failure
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
      }
    }
  };

  const {
    personalInfo: { username: authorUsername },
  } = author;

  return (
    <>
      <hr className="border-border my-1" />
      <div className="flex flex-row justify-between items-center">
        <div className="flex-center gap-2">
          {!isDraft && (
            <>
              <div className="flex-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-lg p-1 pl-0 bg-transparent hover:bg-transparent"
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
                  totalComments={activity?.totalComments}
                />
                {activity && activity.totalComments !== 0 ? (
                  <p className="text-sm mr-1">
                    {formateNumber(activity.totalComments)}
                  </p>
                ) : null}
              </div>

              <div className="flex-center gap-1">
                <MdOutlineRemoveRedEye className="text-lg" />
                {activity && activity.totalReads !== 0 ? (
                  <p className="text-sm">
                    {formateNumber(activity.totalReads)}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {!isDraft && (
            <>
              <Button
                variant="secondary"
                className="bg-transparent hover:bg-transparent p-1 "
                onClick={handleBookmark}
              >
                {isBookmarked ? (
                  <FaBookmark className="text-primary/90 text-lg hover:text-primary" />
                ) : (
                  <FaRegBookmark className="text-secondary-foreground text-lg" />
                )}
              </Button>
              <ShareBlog title={title} description={description} tags={tags} />
            </>
          )}

          {user.username === authorUsername && (
            <ManageBlog blogId={blogId} isDraft={isDraft} />
          )}
        </div>
      </div>
      <LoginPromptModal
        open={showLoginPrompt}
        title={loginPromptTitle}
        message={loginPromptMessage}
        onConfirm={handlePromptConfirm}
        onCancel={handlePromptCancel}
      />
      <hr className="border-border my-1" />
    </>
  );
};

export default BlogInteraction;
