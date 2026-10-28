import { removeFilter } from "../../redux/reducers/filterReducer";
import { PiXBold } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import useURLParams from "../../hooks/useURLParams";

const FilterChip = () => {
  const filters = useSelector((state: RootState) => state.filters);
  const { removeParam } = useURLParams();
  const dispatch = useDispatch();

  const removeFilterChip = (filterKey: string, filterValue: string) => {
    removeParam(`${filterKey}=${filterValue}`);
    dispatch(removeFilter({ [filterKey]: filterValue }));
  };

  const active = Object.keys(filters).flatMap((key) => filters[key].map((value) => ({ key, value })));
  if (active.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {active.map(({ key, value }) => (
        <li key={`${key}-${value}`}>
          <button
            type="button"
            onClick={() => removeFilterChip(key, value)}
            className="inline-flex h-8 items-center gap-1.5 rounded-badge border border-primary/30 bg-primary/10 pl-3 pr-2 text-sm font-medium capitalize text-primary hover:bg-primary/20"
            aria-label={`Remove filter ${value}`}
          >
            {value}
            <PiXBold className="size-3.5" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default FilterChip;
