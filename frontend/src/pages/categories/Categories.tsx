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
      <PageHeader title="Categories" description="Pick a category to see its coupons." />
      <section className="page-container py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading categories">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton h-16 rounded-box" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[...data].sort((a, b) => a.localeCompare(b)).map((category) => (
              <li key={category}>
                <Link
                  to={encodeURIComponent(category)}
                  className="group flex h-16 items-center justify-between gap-2 rounded-box border border-base-300 bg-base-100 px-4 font-semibold capitalize transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="truncate">{category}</span>
                  <PiArrowRightBold
                    className="size-4 shrink-0 text-base-content/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
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
