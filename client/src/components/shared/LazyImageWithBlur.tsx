import React, { useState } from "react";

/**
 * A reusable image component that:
 * - Lazily loads an image using the native `loading="lazy"` attribute.
 * - Shows a blur and slight scale-up while the image is loading.
 * - Transitions smoothly to a sharp and properly scaled image once loaded.
 * - Handles broken image URLs by removing the blur and optionally calling a custom `onError` handler.
 *
 * Props:
 * - `src` (string): The image URL to display.
 * - `alt` (string, optional): The alternative text for the image.
 * - `className` (string, optional): Additional class names for styling.
 * - `onError` (function, optional): A handler to run if the image fails to load.
 */

interface LazyImageWithBlurProps {
  src: string;
  alt?: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}
const LazyImageWithBlur = ({
  src,
  alt = "",
  className = "",
  onError,
}: LazyImageWithBlurProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setHasError(true);
    onError?.(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      className={`object-cover transition duration-500 ease-in-out ${
        isLoaded || hasError ? "blur-0 scale-100" : "blur-sm scale-105"
      } ${className}`}
    />
  );
};

export default LazyImageWithBlur;
