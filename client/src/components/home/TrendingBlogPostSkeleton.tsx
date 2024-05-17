import { Skeleton } from "../ui/skeleton";

const TrendingBlogPostSkeleton = () => {
  const skeletonCount = [1, 2, 3, 4, 5];

  return skeletonCount.map((i) => (
    <div key={i} className="flex gap-5 mb-8">
      <h1 className="text-4xl sm:text-[30px] font-bold text-primary/20 leading-none">
        {i}
      </h1>
      <div>
        <Skeleton className="w-64 md:w-56 h-3" />
        <div className="flex flex-row gap-3 items-center mt-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-col gap-2">
            <Skeleton className="w-16 h-3 mb-1" />
            <Skeleton className="w-12 h-2" />
          </div>
        </div>
      </div>
    </div>
  ));
};

export default TrendingBlogPostSkeleton;
