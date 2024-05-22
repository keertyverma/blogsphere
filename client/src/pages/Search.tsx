import SearchedBlogList from "@/components/search/SearchedBlogList";
import SearchedUserList from "@/components/search/SearchedUserList";
import InPageNavigation from "@/components/shared/InPageNavigation";
import SearchInputBox from "@/components/shared/SearchInputBox";
import { useAuthContext } from "@/context/authContext";
import { Navigate, useSearchParams } from "react-router-dom";

const Search = () => {
  const { isAuthenticated } = useAuthContext();
  const [searchParams] = useSearchParams();

  if (!isAuthenticated) return <Navigate to="/login" />;
  const searchTerm = searchParams.get("q") || "";

  return (
    <div className="h-cover px-0 md:px-10 lg:px-40 xl:px-40 2xl:px-52">
      <section className="mx-auto md:max-w-[728px] px-4 py-20 ">
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
            Search for articles, people and tags
          </h1>
        )}
      </section>
    </div>
  );
};

export default Search;
