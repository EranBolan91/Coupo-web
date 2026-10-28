import { PiArrowRightBold } from "react-icons/pi";
import { getCategories } from "../../database/databaseCalls";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Categories = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  return (
    <>
      <PageHeader title="Categories" description="Pick a category to see every coupon in it." />
      <section className="page-container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading categories">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton h-36 rounded-box" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...data].sort((a, b) => a.localeCompare(b)).map((category) => (
              <li key={category}>
                <Link
                  to={encodeURIComponent(category)}
                  className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-box border-2 border-base-300 bg-base-100 p-6 transition-colors hover:border-base-content hover:bg-primary hover:text-primary-content"
                >
                  <span className="flex items-end justify-between gap-3">
                    <span className="truncate font-display text-4xl font-extrabold capitalize tracking-tight">{category}</span>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-base-200 transition-all group-hover:-rotate-45 group-hover:bg-primary-content group-hover:text-primary">
                      <PiArrowRightBold className="size-5" aria-hidden />
                    </span>
                  </span>
                  <span
                    className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[9rem] font-extrabold uppercase leading-none opacity-[0.04]"
                    aria-hidden="true"
                  >
                    {category.charAt(0)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
};

export default Categories;
