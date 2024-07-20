import { useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked, formateNumber } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IAuthor } from "@/types";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import { IoShareOutline } from "react-icons/io5";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiTwitterXFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import BlogComment from "./BlogComment";
import ManageBlog from "./ManageBlog";

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
}

const BlogInteraction = ({
  id,
  blogId,
  title,
  author,
  likes,
  activity,
  isDraft = false,
}: Props) => {
  const [blogLikes, setBlogLikes] = useState<{ [key: string]: boolean }>({});
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setRedirectedUrl = useAuthStore((s) => s.setRedirectedUrl);

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
      setRedirectedUrl(location.pathname);
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

    // update like count
    await likePost(blogId);
  };

  const copyToClipboard = () => {
    const currentURL = location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        toast.dark("Link copied.", {
          position: "bottom-right",
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to copy link.", {
          position: "bottom-right",
        });
      });
  };

  return (
    <>
      <hr className="border-border my-1" />
      <div className="flex flex-row justify-between items-center">
        <div className="flex-center gap-2 text-muted-foreground hover:text-slate-600">
          {!isDraft && (
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
          )}

          {!isDraft && (
            <div className="flex-center">
              <BlogComment
                blogId={id}
                authorId={authorId}
                totalComments={activity?.totalComments}
              />
              {activity && activity.totalComments !== 0 ? (
                <p className="text-sm mr-1">
                  {formateNumber(activity.totalComments)}
                </p>
              ) : null}
            </div>
          )}

          {!isDraft && user.username === authorUsername && (
            <div className="flex-center gap-1">
              <MdOutlineRemoveRedEye className="text-lg" />
              {activity && activity.totalReads !== 0 ? (
                <p className="text-sm">{formateNumber(activity.totalReads)}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <IoShareOutline className="text-xl text-muted-foreground " />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-3 mr-8 text-muted-foreground p-0">
                <DropdownMenuItem className="p-1">
                  <Button
                    variant="secondary"
                    onClick={copyToClipboard}
                    className="bg-transparent text-muted-foreground w-full justify-start p-2 hover:text-black"
                  >
                    <IoIosLink className="text-lg mr-2" />
                    Copy link
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-0" />
                <DropdownMenuItem className="p-1">
                  <Link
                    to={`https://x.com/intent/tweet?text=${encodeURIComponent(
                      `Read -> ${title}.\n\nCheck it out at BlogSphere!`
                    )}&url=${encodeURIComponent(location.href)}`}
                    target="_blank"
                    className="w-full flex justify-start p-2 font-medium"
                  >
                    <RiTwitterXFill className="text-lg mr-2" />
                    Share to X
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {user.username === authorUsername && <ManageBlog blogId={blogId} />}
        </div>
      </div>
      <hr className="border-border my-1" />
    </>
  );
};

export default BlogInteraction;
