import { collectionsList } from "../../../firebaseCollections";
import { matchesSearch } from "../../logic/couponFilters";
import AdminCouponRow from "./components/AdminCouponRow";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import SearchBar from "../main/components/Searchbar";
import useShowMore from "../../hooks/useShowMore";
import { useMemo, useState } from "react";

const tabs = [
  { value: "all", label: "All" },
  { value: "coupon", label: "Store" },
  { value: "socialCoupon", label: "Social" },
  { value: "expired", label: "Expired" },
] as const;

// Every coupon on the site, store and social, with Edit / Delete.
const AdminCoupons = () => {
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("all");

  const results = useMemo(() => {
    const now = Date.now();
    const all = [...(store.data ?? []), ...(social.data ?? [])].sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
    return all.filter((coupon) => {
      const expired = (coupon.expiry?.toMillis?.() ?? Infinity) < now;
      const inTab = tab === "all" || (tab === "expired" ? expired : coupon.type === tab);
      return inTab && matchesSearch(coupon, search);
    });
  }, [store.data, social.data, search, tab]);

  const { visible, lastItemRef } = useShowMore(results, `${search}|${tab}`, 20);
  const isPending = store.isPending || social.isPending;
  const isError = store.isError || social.isError;

  return (
    <AdminLayout title="Coupons" description="Every coupon on Coupo. Edit or delete any of them, including ones users shared.">
      <div className="max-w-xl">
        <SearchBar filter={setSearch} value={search} placeholder="Search by brand, code, category or user" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Which coupons">
        {tabs.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={tab === option.value}
            onClick={() => setTab(option.value)}
            className={`btn btn-sm h-10 min-h-10 px-4 ${tab === option.value ? "btn-secondary" : "btn-ghost border-base-300 bg-base-100"}`}
          >
            {option.label}
          </button>
        ))}
        {!isPending && !isError && (
          <span className="ml-auto text-sm text-base-content/60" aria-live="polite">
            {results.length === 1 ? "1 coupon" : `${results.length} coupons`}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {isPending ? (
          Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-24 rounded-box" />)
        ) : isError ? (
          <LoadError what="coupons" onRetry={() => [store.refetch(), social.refetch()]} />
        ) : results.length === 0 ? (
          <EmptyState title="No coupons match" description="Try another word or tab." />
        ) : (
          visible.map((coupon, i) => (
            <div key={`${coupon.type}-${coupon.id}`} ref={i === visible.length - 1 ? (lastItemRef as React.Ref<HTMLDivElement>) : undefined}>
              <AdminCouponRow coupon={coupon} />
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
