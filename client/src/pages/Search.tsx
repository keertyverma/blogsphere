import GetSearchedBlog from "@/components/search/GetSearchedBlog";
import InPageNavigation from "@/components/shared/InPageNavigation";
import SearchInputBox from "@/components/shared/SearchInputBox";
import { useAuthContext } from "@/context/authContext";
import { Navigate, useSearchParams } from "react-router-dom";

const Search = () => {
  const { isAuthenticated } = useAuthContext();
  const [searchParams] = useSearchParams();
  // const [searchText, setSearchText] = useState(searchParams.get("q") || "");

  const searchText = searchParams.get("q") || "";
  if (!isAuthenticated) return <Navigate to="/login" />;

  console.log("searchText = ", searchText);

  return (
    <div className="h-cover px-0 md:px-10 lg:px-40 xl:px-40 2xl:px-52">
      <section className="mx-auto md:max-w-[728px] px-4 py-20 ">
        <div className="my-4">
          <SearchInputBox />
        </div>

        <InPageNavigation routes={["latest", "people"]}>
          {/* search in latest blogs */}
          {searchText && <GetSearchedBlog />}

          {/* search by people */}
          <div>Fetch people ...</div>
        </InPageNavigation>

        {!searchText && (
          <h1 className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10">
            Search for articles, people and tags
          </h1>
        )}
      </section>
    </div>
  );
};

export default Search;
