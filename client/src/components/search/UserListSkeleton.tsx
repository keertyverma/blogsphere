import { Skeleton } from "../ui/skeleton";

const UserListSkeleton = () => {
  const skeletonCount = [1, 2, 3, 4, 5];

  return skeletonCount.map((i) => (
    <div
      key={i}
      className="flex flex-row gap-3 items-center p-4 border-b border-border"
    >
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="flex-col gap-2">
        <Skeleton className="w-16 h-3 mb-1" />
        <Skeleton className="w-12 h-2" />
      </div>
    </div>
  ));
};

export default UserListSkeleton;
