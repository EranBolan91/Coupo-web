import { addFilter, removeFilter } from "../../redux/reducers/filterReducer";
import { getCategories } from "../../database/databaseCalls";
import { useQuery } from "@tanstack/react-query";
import { AiFillFilter } from "react-icons/ai";
import useTest from "../../hooks/useTest";
import { useDispatch } from "react-redux";

const Filter = () => {
  const { setParam: setParamTest, removeParam: removeParamTest } = useTest();
  const dispatch = useDispatch();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked === true) {
      setParamTest(e.target.name, e.target.value);
      dispatch(addFilter(e.target.value));
    } else {
      removeParamTest(`${e.target.name}=${e.target.value}`);
      dispatch(removeFilter(e.target.value));
    }
  };

  return (
    <div className="drawer z-30">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer"
          className="btn w-full md:w-auto btn-primary btn-outline drawer-button"
        >
          Filter coupons
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <div className="flex items-center z-10 text-lg md:text-2xl">
            <AiFillFilter />
            <span className="ml-1">Filter Coupons</span>
          </div>
          <div className="divider"></div>
          <li>
            <span className="text-lg">Categories</span>
            {categories &&
              categories.map((category) => (
                <label key={category} className="label cursor-pointer justify-start">
                  <input
                    onChange={handleFilter}
                    name="category"
                    type="checkbox"
                    value={category}
                    className="checkbox checkbox-sm"
                  />
                  <span className="label-text capitalize">{category}</span>
                </label>
              ))}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Filter;
