import { Skeleton } from "../ui/skeleton";

const BlogPostCardSkeleton = () => {
  const skeletonCount = [1, 2, 3];

  return skeletonCount.map((i) => (
    <article
      key={i}
      className="w-full md:max-w-2xl lg:max-w-3xl h-32 md:h-44 flex flex-col gap-4 md:gap-5 pt-0 md:pt-8 lg:p-6 lg:pb-5 mb-6 max-lg:border-b border-border lg:border lg:shadow-sm lg:rounded-2xl"
    >
      <section className="p-0">
        <div className="flex flex-row gap-3 items-center">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-col gap-2">
            <Skeleton className="w-16 h-3 mb-1" />
            <Skeleton className="w-12 h-2" />
          </div>
        </div>
        <div className="flex flex-row gap-2 sm:gap-3 md:gap-6 justify-between max-sm:mb-3">
          <div>
            <Skeleton className="w-48 md:w-96 h-4 mt-2" />
            <Skeleton className="w-48 md:w-96 h-2 mt-2" />
            <Skeleton className="w-48 md:w-96 h-2 mt-1" />
          </div>
          <Skeleton className="w-32 h-15 md:w-40 md:h-30 rounded-md" />
        </div>
      </section>
    </article>
  ));
};

export default BlogPostCardSkeleton;
