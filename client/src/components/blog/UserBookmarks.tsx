import { useGetUserBookmarks } from "@/lib/react-query/queries";
import { IBlog, IBookmark } from "@/types";
import { useNavigate } from "react-router-dom";
import BlogPostCard from "../home/BlogPostCard";
import BlogPostCardSkeleton from "../home/BlogPostCardSkeleton";
import AnimationWrapper from "../shared/AnimationWrapper";
import { Button } from "../ui/button";

const UserBookmarks = () => {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetUserBookmarks();

  if (isLoading) return <BlogPostCardSkeleton />;
  if (error) console.error(error);

  const bookmarks = data?.pages.flatMap((page) => page.results) || [];
  if (bookmarks.length === 0) {
    return (
      <div className="w-full flex-center md:pt-28 md:pb-32 sm:pt-16 sm:pb-24 pt-14 pb-20 px-5">
        <div className="flex flex-col items-center gap-3 max-w-lg">
          <p className="md:text-xl text-lg text-center font-semibold">
            You haven't bookmarked any blog yet.
          </p>
          <p className="sm:text-base text-sm text-muted-foreground text-center">
            Found an interesting blog that you want to revisit? Hit the bookmark
            icon on the blog to save them for later and start curating your
            collection!
          </p>
          <Button
            size="sm"
            className="rounded-full mt-2"
            onClick={() => navigate("/")}
          >
            Discover blogs to bookmark
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {bookmarks.map((bookmark: IBookmark, index: number) => (
        <AnimationWrapper
          key={index}
          transition={{ duration: 1, delay: index * 0.1 }}
        >
          <BlogPostCard
            content={bookmark.blog as IBlog}
            author={(bookmark.blog as IBlog).authorDetails}
            showLikeCount={false}
          />
        </AnimationWrapper>
      ))}

      {hasNextPage && (
        <div className="flex-center">
          <Button
            variant="secondary"
            size="sm"
            className="capitalize"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "loading..." : "load more"}
          </Button>
        </div>
      )}
    </>
  );
};

export default UserBookmarks;
