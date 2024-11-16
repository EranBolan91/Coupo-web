import { removeFilter } from "../../redux/reducers/filterReducer";
import { IoIosCloseCircleOutline } from "react-icons/io";
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

  return (
    <div className="flex my-2">
      {filters &&
        Object.keys(filters).map((key) =>
          filters[key].map((filter) => (
            <div key={filter} className="badge badge-info badge-lg gap-1 mx-1">
              <IoIosCloseCircleOutline
                style={{ cursor: "pointer" }}
                onClick={() => removeFilterChip(key, filter)}
              />
              {filter}
            </div>
          ))
        )}
    </div>
  );
};

export default FilterChip;
