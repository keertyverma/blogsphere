import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface TextWithLoaderProps {
  text: string;
  isLoading: boolean;
}

const TextWithLoader: React.FC<TextWithLoaderProps> = ({ text, isLoading }) => (
  <div className="flex-center gap-1">
    <span>{text}</span>
    {isLoading && (
      <LoadingSpinner className="h-6 md:w-6 text-muted-foreground" />
    )}
  </div>
);

export default TextWithLoader;
