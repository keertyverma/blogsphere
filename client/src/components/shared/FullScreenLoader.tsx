import LoadingSpinner from "../ui/LoadingSpinner";

interface FullScreenLoaderProps {
  message?: string;
}

const FullScreenLoader = ({ message }: FullScreenLoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-white">
        <LoadingSpinner className="w-12 h-12 text-inherit" />
        <p className="text-base md:text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
