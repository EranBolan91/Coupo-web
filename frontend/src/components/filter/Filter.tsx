import { getCategories } from "../../database/databaseCalls";
import { discountOptions } from "../../logic/couponFilters";
import { CouponSearch } from "../../hooks/useCouponSearch";
import { PiSlidersHorizontalBold, PiXBold } from "react-icons/pi";
import { useQuery } from "@tanstack/react-query";

interface Props {
  search: CouponSearch;
  // Brand names in the current feed (see brandsInFeed).
  brands: string[];
}

const optionClass = "label cursor-pointer justify-start gap-3 rounded-btn px-2 hover:bg-base-200";
const legendClass = "mb-2 text-sm font-semibold text-base-content/70";

// Filters drawer: category, brand, minimum discount and "expires this week". All state lives in the URL.
const Filter = ({ search, brands }: Props) => {
  const { filters, activeFilterCount, toggleFilter, setMinDiscount, setExpiringSoon, clearFilters } = search;
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  return (
    <div className="drawer z-40 w-auto">
      <input id="filter-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="filter-drawer" className="btn btn-sm h-10 min-h-10 border-base-300 bg-base-100 font-semibold">
          <PiSlidersHorizontalBold className="size-4" aria-hidden />
          Filters
          {activeFilterCount > 0 && <span className="badge badge-primary badge-sm">{activeFilterCount}</span>}
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
            <legend className={legendClass}>Expiry</legend>
            <label className={optionClass}>
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={filters.expiringSoon}
                onChange={(e) => setExpiringSoon(e.target.checked)}
              />
              <span className="label-text">Expires within 7 days</span>
            </label>
          </fieldset>

          <fieldset className="mt-6">
            <legend className={legendClass}>Discount</legend>
            {[{ value: 0, label: "Any discount" }, ...discountOptions].map((option) => (
              <label key={option.value} className={optionClass}>
                <input
                  type="radio"
                  name="min-discount"
                  className="radio radio-primary radio-sm"
                  checked={filters.minDiscount === option.value}
                  onChange={() => setMinDiscount(option.value)}
                />
                <span className="label-text">{option.label}</span>
              </label>
            ))}
          </fieldset>

          {categories.length > 0 && (
            <fieldset className="mt-6">
              <legend className={legendClass}>Categories</legend>
              {categories.map((category) => (
                <label key={category} className={optionClass}>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleFilter("category", category)}
                  />
                  <span className="label-text capitalize">{category}</span>
                </label>
              ))}
            </fieldset>
          )}

          {brands.length > 0 && (
            <fieldset className="mt-6">
              <legend className={legendClass}>Brands</legend>
              {brands.map((brand) => (
                <label key={brand} className={optionClass}>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleFilter("brand", brand)}
                  />
                  <span className="label-text">{brand}</span>
                </label>
              ))}
            </fieldset>
          )}

          {activeFilterCount > 0 && (
            <button type="button" className="btn btn-ghost btn-sm mt-6 self-start" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
