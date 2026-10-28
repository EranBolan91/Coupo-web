import { PiMagnifyingGlassBold } from "react-icons/pi";

interface Props {
  filter: (text: string) => void;
  placeholder?: string;
}

const SearchBar = ({ filter, placeholder = "Search by brand" }: Props) => {
  return (
    <label className="input input-bordered flex w-full items-center gap-2 bg-base-100">
      <PiMagnifyingGlassBold className="size-5 shrink-0 text-base-content/50" aria-hidden />
      <span className="sr-only">Search coupons</span>
      <input
        type="search"
        className="grow border-0 bg-transparent p-0 focus:outline-none focus:ring-0"
        placeholder={placeholder} onChange={(e) => filter(e.target.value)} />
    </label>
  );
};

export default SearchBar;
