import AnimationWrapper from "./AnimationWrapper";

// Full-screen overlay used during theme switch to enable smooth fade transitions
// It fades out as the theme is toggled in the background
const ThemeFadeOverlay = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <AnimationWrapper
      keyValue="theme-fade"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 bg-background z-[9999] pointer-events-none"
    >
      <div className="w-full h-full" />
    </AnimationWrapper>
  );
};

export default ThemeFadeOverlay;
