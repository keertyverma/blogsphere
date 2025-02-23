import { cn } from "@/lib/utils";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface TextWithLoaderProps {
  text: string;
  isLoading: boolean;
  loaderClassName?: string;
}

const TextWithLoader: React.FC<TextWithLoaderProps> = ({
  text,
  isLoading,
  loaderClassName,
}) => (
  <div className="flex-center gap-1">
    <span aria-live="polite">{text}</span>
    {isLoading && (
      <LoadingSpinner
        className={cn("h-6 md:w-6 text-muted-foreground", loaderClassName)}
      />
    )}
  </div>
);

export default TextWithLoader;
