import { Skeleton } from "../ui/skeleton";

const BlogEditorSkeleton = () => {
  return (
    <section className="md:max-w-[680px] lg:max-w-[800px] max-sm:px-1 px-0 center">
      <div className="mx-4">
        <Skeleton className="w-full h-40 md:h-56 rounded-md" />
        <div className="my-6">
          <Skeleton className="w-64 md:w-[80vh]  h-10 mt-2" />
          <Skeleton className="w-44 md:w-80  h-2 mt-4" />
          <Skeleton className="w-44 md:w-80  h-2 mt-4" />
          <Skeleton className="w-44 md:w-80  h-2 mt-4" />
        </div>
      </div>
    </section>
  );
};

export default BlogEditorSkeleton;
