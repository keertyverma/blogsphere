import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <>
      <Loader2
        className={cn(
          "h-8 w-8 md:h-10 md:w-10 text-muted-foreground/60 animate-spin",
          className
        )}
      />
    </>
  );
};

export default LoadingSpinner;
