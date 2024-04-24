/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  initial?: { [key: string]: any };
  animate?: { [key: string]: any };
  transition?: { [key: string]: any };
  keyValue?: string;
  className?: string;
}
const AnimationWrapper = ({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 0.5 },
  keyValue,
  className,
}: Props) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
