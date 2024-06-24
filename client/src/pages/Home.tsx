import GetLatestBlogs from "@/components/home/GetLatestBlogs";
import GetTrendingBlog from "@/components/home/GetTrendingBlog";
import TagList from "@/components/home/TagList";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import { useAuthStore } from "@/store";
import { useState } from "react";
import { IoTrendingUpSharp } from "react-icons/io5";
import { Navigate } from "react-router-dom";

const Home = () => {
  const [selectedTag, setSelectedTag] = useState("all");

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <AnimationWrapper>
      <section className="h-cover md:flex md:justify-center gap-10 py-16 ">
        <div className="max-md:hidden">
          {/* filter */}
          <TagList
            selectedTag={selectedTag}
            onSelect={(tag: string) => setSelectedTag(tag)}
          />

          {/* latest blogs */}
          <GetLatestBlogs selectedTag={selectedTag} />
        </div>

        <aside className="min-w-[40%] lg:min-w-[400px] max-w-min max-md:hidden border-l border-border pl-8 pt-3 mt-4">
          {/* trending blogs */}
          <div>
            <h1 className="font-semibold text-xl mb-4 flex gap-2">
              Trending
              <IoTrendingUpSharp className="text-muted-foreground" />
            </h1>
            <GetTrendingBlog />
          </div>
        </aside>

        {/* In page navigation on mobile screens */}
        <div className="md:hidden mt-4">
          <InPageNavigation routes={["home", "trending"]}>
            <>
              <TagList
                selectedTag={selectedTag}
                onSelect={(tag: string) => setSelectedTag(tag)}
              />

              {/* latest blogs */}
              <GetLatestBlogs selectedTag={selectedTag} />
            </>

            {/* Trending blogs on mobile screen */}
            <GetTrendingBlog />
          </InPageNavigation>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
