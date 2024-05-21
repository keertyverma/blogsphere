import SearchInputBox from "@/components/shared/SearchInputBox";
import { useAuthContext } from "@/context/authContext";
import { Navigate, useSearchParams } from "react-router-dom";

const Search = () => {
  const { isAuthenticated } = useAuthContext();
  const [searchParams] = useSearchParams();

  if (!isAuthenticated) return <Navigate to="/login" />;

  const searchText = searchParams.get("q");

  return (
    <section className="h-cover">
      <div className="md:hidden">
        <SearchInputBox />
      </div>

      <h1 className="text-lg md:text-2xl text-muted-foreground font-semibold">
        Results for{" "}
        <span className="text-secondary-foreground">{searchText}</span>
      </h1>
    </section>
  );
};

export default Search;
