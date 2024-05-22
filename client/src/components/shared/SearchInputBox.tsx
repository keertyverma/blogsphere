import { KeyboardEvent, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const SearchInputBox = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const query = input.value;

    if (e.key === "Enter" && query.length) {
      navigate(`/search?q=${query}`);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    navigate("/search");
  };

  return (
    <div className="relative w-full mx-auto py-4 md:p-0">
      <BsSearch className="absolute left-[5%] md:left-5 top-1/2 md:pointer-events-none -translate-y-1/2 text-muted-foreground" />
      <Input
        className="bg-accent pl-12 placeholder:text-muted-foreground text-accent-foreground rounded-full focus-visible:ring-1"
        placeholder="Search"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
        }}
        onKeyDown={handleSearch}
      />
      {searchInput && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-[5%] md:right-5 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={handleClear}
        >
          <IoClose />
        </Button>
      )}
    </div>
  );
};

export default SearchInputBox;
