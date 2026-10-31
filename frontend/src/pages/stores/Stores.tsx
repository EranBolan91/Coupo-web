import StoreTiles from "../../components/stores/StoreTiles";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import useAllCoupons from "../../hooks/useAllCoupons";
import { groupStores } from "../../logic/stores";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

// Every store with at least one coupon, A-Z: /stores.
const Stores = () => {
  const { data: coupons, isPending, isError, refetch } = useAllCoupons();
  const stores = useMemo(() => groupStores(coupons), [coupons]);
  const [search, setSearch] = useState("");
  const shown = stores.filter((store) => store.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <PageHeader title="All stores" description="Every store on Coupo, A to Z, with how many working codes each one has.">
        <label className="input input-bordered flex h-12 items-center gap-2 rounded-btn">
          <span className="sr-only">Find a store</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a store"
            className="grow border-0 bg-transparent p-0 focus:ring-0"
          />
        </label>
      </PageHeader>
      <section className="page-container py-8 pb-20">
        {isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading stores">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="skeleton h-20 rounded-box" />
            ))}
          </div>
        ) : isError ? (
          <LoadError what="stores" onRetry={refetch} />
        ) : shown.length === 0 ? (
          <EmptyState
            title={stores.length === 0 ? "No stores yet" : "No store by that name"}
            description="Know a code for it? Share it and the store gets its own page."
            action={
              <Link to="/addcoupon" className="btn btn-primary">
                Share a coupon
              </Link>
            }
          />
        ) : (
          <StoreTiles stores={shown} />
        )}
      </section>
    </>
  );
};

export default Stores;
