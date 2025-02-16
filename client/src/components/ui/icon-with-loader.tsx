import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface IconWithLoaderProps {
  icon: React.ElementType;
  isLoading: boolean;
  colorClass?: string;
}

const IconWithLoader: React.FC<IconWithLoaderProps> = ({
  icon: Icon,
  isLoading,
  colorClass = "text-muted-foreground",
}) => (
  // Icon with a loader overlay.
  <div className="relative flex-center w-10 h-10 p-0">
    <Icon
      className={`${colorClass} text-3xl ${
        isLoading ? "opacity-30" : "opacity-100"
      }`}
    />
    {isLoading && (
      <LoadingSpinner className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
    )}
  </div>
);

export default IconWithLoader;
