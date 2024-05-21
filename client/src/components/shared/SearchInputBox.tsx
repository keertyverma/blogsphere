import { KeyboardEvent } from "react";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";

const SearchInputBox = () => {
  const navigate = useNavigate();

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const query = input.value;

    if (e.key === "Enter" && query.length) {
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <div className="relative w-full md:w-auto py-4 md:p-0">
      <BsSearch className="absolute left-[5%] md:left-5 top-1/2 md:pointer-events-none -translate-y-1/2 text-muted-foreground" />
      <Input
        className="bg-accent pl-12 placeholder:text-muted-foreground text-accent-foreground rounded-full focus-visible:ring-1"
        placeholder="Search"
        onKeyDown={handleSearch}
      />
    </div>
  );
};

export default SearchInputBox;
