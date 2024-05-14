import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface Props {
  routes: string[];
  children: ReactNode | ReactNode[];
  defaultActiveIndex?: number;
  defaultHidden?: string[];
}

const InPageNavigation = ({
  routes,
  children,
  defaultActiveIndex = 0,
  defaultHidden = [],
}: Props) => {
  const [activeNavIndex, setActiveNavIndex] = useState(defaultActiveIndex);

  const activeTabRef = useRef<HTMLButtonElement>(null);
  const activeTabLineRef = useRef<HTMLHRElement>(null);

  const changePageState = (btn: HTMLButtonElement, index: number) => {
    setActiveNavIndex(index);

    if (activeTabLineRef && activeTabLineRef.current) {
      const { offsetWidth, offsetLeft } = btn;
      activeTabLineRef.current.style.width = `${offsetWidth}px`;
      activeTabLineRef.current.style.left = `${offsetLeft}px`;
    }
  };

  useEffect(() => {
    if (activeTabRef.current)
      changePageState(activeTabRef.current, defaultActiveIndex);
  }, []);

  return (
    <>
      <div className="relative flex flex-nowrap gap-3 mb-8 bg-white border-b border-border overflow-x-auto">
        {routes.map((route, index) => (
          <Button
            ref={index === defaultActiveIndex ? activeTabRef : null}
            key={index}
            variant="link"
            onClick={(e) => {
              changePageState(e.target as HTMLButtonElement, index);
            }}
            className={`font-semibold capitalize hover:no-underline ${
              activeNavIndex === index
                ? "text-primary"
                : "text-muted-foreground"
            } ${defaultHidden.includes(route) ? " md:hidden" : " "}`}
          >
            {route}
          </Button>
        ))}

        <hr
          ref={activeTabLineRef}
          className="absolute bottom-0 duration-300 bg-accent-foreground h-[2px]"
        />
      </div>
      {Array.isArray(children) ? children[activeNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
