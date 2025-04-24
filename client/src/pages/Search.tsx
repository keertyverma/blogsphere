import SearchedBlogList from "@/components/search/SearchedBlogList";
import SearchedUserList from "@/components/search/SearchedUserList";
import InPageNavigation from "@/components/shared/InPageNavigation";
import SearchInputBox from "@/components/shared/SearchInputBox";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";

  return (
    <>
      <Helmet>
        <title>Search | BlogSphere</title>
        <meta
          name="description"
          content="Search for articles, people, and more on BlogSphere."
        />
      </Helmet>
      <div className="h-cover px-0 md:px-10 lg:px-40 xl:px-40 2xl:px-52">
        <section className="mx-auto md:max-w-[728px] px-6 py-20 ">
          <div className="my-4">
            <SearchInputBox />
          </div>

          <InPageNavigation routes={["latest", "people"]}>
            {/* search in latest blogs */}
            {searchTerm && (
              <div className="mt-6">
                <SearchedBlogList searchTerm={searchTerm} />
              </div>
            )}

            {/* search by people */}
            {searchTerm && (
              <div>
                <SearchedUserList searchTerm={searchTerm} />
              </div>
            )}
          </InPageNavigation>

          {!searchTerm && (
            <h1 className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10">
              Search for articles, people and more
            </h1>
          )}
        </section>
      </div>
    </>
  );
};

export default Search;
