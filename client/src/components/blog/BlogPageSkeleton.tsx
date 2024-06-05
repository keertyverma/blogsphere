import { Skeleton } from "../ui/skeleton";

const BlogPageSkeleton = () => {
  return (
    <section className="md:max-w-[680px] lg:max-w-[800px] max-sm:px-1 px-0 center">
      <div className="mx-4">
        {/* blog basic information */}
        <Skeleton className="w-full h-40 md:h-56 rounded-md" />

        <div className="flex flex-col gap-2 mb-2">
          <Skeleton className="w-full h-6 mt-2" />
          <div className="flex flex-row gap-3 items-center my-2">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="w-16 h-3 mb-1" />
              <Skeleton className="w-12 h-2" />
            </div>
          </div>
        </div>

        {/* blog content */}
        <div className="my-6">
          <Skeleton className="w-64 md:w-96  h-4 mt-2" />
          <Skeleton className="w-44 md:w-72  h-2 mt-2" />
        </div>
      </div>
    </section>
  );
};

export default BlogPageSkeleton;
