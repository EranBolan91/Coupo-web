import { discountOptions } from "../../logic/couponFilters";
import { CouponSearch } from "../../hooks/useCouponSearch";
import { PiXBold } from "react-icons/pi";

// One removable chip per active filter, under the search bar.
const FilterChip = ({ search }: { search: CouponSearch }) => {
  const { filters, toggleFilter, setMinDiscount, setExpiringSoon } = search;

  const chips = [
    ...filters.categories.map((value) => ({ label: value, capitalize: true, remove: () => toggleFilter("category", value) })),
    ...filters.brands.map((value) => ({ label: value, capitalize: false, remove: () => toggleFilter("brand", value) })),
    ...(filters.minDiscount > 0
      ? [{
          label: discountOptions.find((o) => o.value === filters.minDiscount)?.label ?? `${filters.minDiscount}% or more`,
          capitalize: false,
          remove: () => setMinDiscount(0),
        }]
      : []),
    ...(filters.expiringSoon
      ? [{ label: "Expires within 7 days", capitalize: false, remove: () => setExpiringSoon(false) }]
      : []),
  ];
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map(({ label, capitalize, remove }, i) => (
        <li key={`${i}-${label}`}>
          <button
            type="button"
            onClick={remove}
            className={`inline-flex h-8 items-center gap-1.5 rounded-badge border border-base-content/15 bg-primary pl-3 pr-2 text-sm font-medium text-primary-content hover:brightness-95 ${
              capitalize ? "capitalize" : ""
            }`}
            aria-label={`Remove filter ${label}`}
          >
            {label}
            <PiXBold className="size-3.5" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default FilterChip;
