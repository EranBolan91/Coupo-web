import { PiMagnifyingGlassBold } from "react-icons/pi";

interface Props {
  filter: (text: string) => void;
  placeholder?: string;
}

const SearchBar = ({ filter, placeholder = "Search by brand" }: Props) => {
  return (
    <label className="input input-bordered flex h-14 w-full items-center gap-3 border-2 bg-base-100 px-5 text-base focus-within:border-base-content">
      <PiMagnifyingGlassBold className="size-5 shrink-0 text-base-content/60" aria-hidden />
      <span className="sr-only">Search coupons</span>
      <input
        type="search"
        className="grow border-0 bg-transparent p-0 focus:outline-none focus:ring-0"
        placeholder={placeholder} onChange={(e) => filter(e.target.value)} />
    </label>
  );
};

export default SearchBar;
