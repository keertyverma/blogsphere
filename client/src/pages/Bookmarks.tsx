import UserBookmarks from "@/components/blog/UserBookmarks";
import AnimationWrapper from "@/components/shared/AnimationWrapper";

const Bookmarks = () => {
  return (
    <AnimationWrapper>
      <div className="h-cover px-0 md:px-10">
        <section className="px-6 mx-auto md:max-w-[728px] flex flex-col gap-5 py-24">
          <div className="mb-5">
            <h3 className="text-[20px] md:h3-bold !font-semibold capitalize text-left">
              Bookmarks
            </h3>
            <p className="mt-1 text-muted-foreground">
              All the blogs you've saved on Blogsphere
            </p>
            <hr className="mt-2 border-1 border-border" />
          </div>

          <div className="w-full">
            <UserBookmarks />
          </div>
        </section>
      </div>
    </AnimationWrapper>
  );
};

export default Bookmarks;
