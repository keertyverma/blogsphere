import GetLatestBlogs from "@/components/home/GetLatestBlogs";
import GetTrendingBlog from "@/components/home/GetTrendingBlog";
import TagList from "@/components/home/TagList";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import { useMediaQuery } from "@react-hook/media-query";
import { IoTrendingUpSharp } from "react-icons/io5";

const HomePage = () => {
  const isTabletOrLargerScreen = useMediaQuery("(min-width: 768px)");

  return (
    <AnimationWrapper>
      <section className="h-cover md:flex md:justify-center gap-10 py-16">
        {isTabletOrLargerScreen ? (
          // larger screen view
          <>
            <div>
              {/* filter */}
              <TagList />

              {/* latest blogs */}
              <GetLatestBlogs />
            </div>

            <aside className="relative min-w-[40%] lg:min-w-[400px] max-w-min max-md:hidden border-l border-border pl-8 pt-3 mt-4">
              {/* trending blogs */}
              <div className="sticky -top-[15%]">
                <h1 className="font-semibold text-xl mb-4 flex gap-2">
                  Trending
                  <IoTrendingUpSharp className="text-muted-foreground" />
                </h1>
                <GetTrendingBlog />
              </div>
            </aside>
          </>
        ) : (
          // mobile screen view
          <div className="mt-4">
            {/* In page navigation */}
            <InPageNavigation routes={["home", "trending"]}>
              <>
                <TagList />

                {/* latest blogs */}
                <GetLatestBlogs />
              </>

              {/* Trending blogs on mobile screen */}
              <GetTrendingBlog />
            </InPageNavigation>
          </div>
        )}
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
