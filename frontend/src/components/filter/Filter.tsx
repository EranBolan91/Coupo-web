import { addFilter, removeFilter } from "../../redux/reducers/filterReducer";
import { getCategories } from "../../database/databaseCalls";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import useURLParams from "../../hooks/useURLParams";
import { useQuery } from "@tanstack/react-query";
import { PiSlidersHorizontalBold, PiXBold } from "react-icons/pi";

const Filter = () => {
  const { setParam, removeParam } = useURLParams();
  const filters = useSelector((state: RootState) => state.filters);
  const dispatch = useDispatch();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked === true) {
      setParam(e.target.name, e.target.value);
      dispatch(addFilter({ [e.target.name]: e.target.value }));
    } else {
      removeParam(`${e.target.name}=${e.target.value}`);
      dispatch(removeFilter({ [e.target.name]: e.target.value }));
    }
  };

  const activeCount = Object.values(filters).reduce((sum, values) => sum + values.length, 0);

  return (
    <div className="drawer z-40 w-auto">
      <input id="filter-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="filter-drawer" className="btn btn-sm h-10 min-h-10 border-base-300 bg-base-100 font-semibold">
          <PiSlidersHorizontalBold className="size-4" aria-hidden />
          Filters
          {activeCount > 0 && <span className="badge badge-primary badge-sm">{activeCount}</span>}
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="filter-drawer" aria-label="Close filters" className="drawer-overlay"></label>
        <div className="flex min-h-full w-80 max-w-[85vw] flex-col bg-base-100 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Filters</h2>
            <label htmlFor="filter-drawer" className="btn btn-ghost btn-sm btn-square" aria-label="Close filters">
              <PiXBold className="size-5" aria-hidden />
            </label>
          </div>
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold text-base-content/70">Categories</legend>
            <div className="flex flex-col">
              {categories?.map((category) => (
                <label key={category} className="label cursor-pointer justify-start gap-3 rounded-btn px-2 hover:bg-base-200">
                  <input
                    onChange={handleFilter}
                    name="category"
                    type="checkbox"
                    value={category}
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={filters["category"]?.includes(category) ?? false}
                  />
                  <span className="label-text capitalize">{category}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default Filter;
