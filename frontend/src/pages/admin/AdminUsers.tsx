import { PiCheckCircleFill, PiEnvelopeSimpleBold } from "react-icons/pi";
import { collectionsList } from "../../../firebaseCollections";
import { AdminUser, getAllUsers } from "../../database/users";
import EmptyState from "../../components/ui/EmptyState";
import LoadError from "../../components/ui/LoadError";
import SharerAvatar from "../sharers/SharerAvatar";
import useCouponFeed from "../../hooks/useCouponFeed";
import { AdminLayout } from "./components/AdminSidebar";
import SearchBar from "../main/components/Searchbar";
import useShowMore from "../../hooks/useShowMore";
import { sharerPath } from "../../logic/sharers";
import { useQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const DAY = 24 * 60 * 60 * 1000;
const millis = (t: Timestamp | undefined) => t?.toMillis?.() ?? 0;
const shortDate = (t: Timestamp | undefined) =>
  t?.toDate?.().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) ?? "-";
const fullName = (user: AdminUser) => [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

const sorts = [
  { value: "newest", label: "Newest" },
  { value: "active", label: "Last login" },
  { value: "sharers", label: "Most coupons" },
] as const;
type Sort = (typeof sorts)[number]["value"];

const UserRow = ({ user, shared }: { user: AdminUser; shared: number }) => {
  const name = fullName(user);
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4 sm:flex-nowrap sm:p-5">
      {user.imageURL ? (
        <img src={user.imageURL} alt="" className="size-12 shrink-0 rounded-full object-cover" loading="lazy" />
      ) : (
        <SharerAvatar name={name || user.email || ""} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-extrabold">{name || "No name"}</p>
        <p className="flex items-center gap-1.5 truncate text-sm text-base-content/70">
          <PiEnvelopeSimpleBold className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{user.email || "No email"}</span>
          {user.isEmailVerified && (
            <PiCheckCircleFill className="size-4 shrink-0 text-accent" aria-label="Email verified" title="Email verified" />
          )}
        </p>
      </div>
      <dl className="grid w-full grid-cols-3 gap-4 text-sm sm:w-auto sm:shrink-0 sm:text-right">
        <div>
          <dt className="text-base-content/60">Joined</dt>
          <dd className="font-semibold">{shortDate(user.creationDate)}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">Last login</dt>
          <dd className="font-semibold">{shortDate(user.lastLogin)}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">Coupons</dt>
          <dd className="font-semibold">
            {shared > 0 ? (
              <Link to={sharerPath(user.id)} className="link link-hover">
                {shared}
              </Link>
            ) : (
              0
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
};

// /admin/users: everyone who signed up (their Users doc), newest first, with search and sorting.
const AdminUsers = () => {
  const users = useQuery({ queryKey: ["adminUsers"], queryFn: getAllUsers });
  const store = useCouponFeed(collectionsList.coupons);
  const social = useCouponFeed(collectionsList.socialCoupons);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const sharedBy = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const coupon of [...(store.data ?? []), ...(social.data ?? [])]) {
      if (coupon.userID) counts[coupon.userID] = (counts[coupon.userID] ?? 0) + 1;
    }
    return counts;
  }, [store.data, social.data]);

  const all = useMemo(() => users.data ?? [], [users.data]);
  const joinedThisWeek = useMemo(() => all.filter((u) => millis(u.creationDate) >= Date.now() - 7 * DAY).length, [all]);

  const results = useMemo(() => {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = all.filter((user) => {
      const text = `${fullName(user)} ${user.email ?? ""}`.toLowerCase();
      return words.every((word) => text.includes(word));
    });
    const key = (user: AdminUser) =>
      sort === "active" ? millis(user.lastLogin) : sort === "sharers" ? sharedBy[user.id] ?? 0 : millis(user.creationDate);
    return matches.sort((a, b) => key(b) - key(a) || millis(b.creationDate) - millis(a.creationDate));
  }, [all, search, sort, sharedBy]);

  const { visible, lastItemRef } = useShowMore(results, `${search}|${sort}`, 30);

  return (
    <AdminLayout title="Users" description="Everyone who signed up to Coupo.">
      <div className="max-w-xl">
        <SearchBar filter={setSearch} value={search} placeholder="Search by name or email" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Sort users">
        {sorts.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={sort === option.value}
            onClick={() => setSort(option.value)}
            className={`btn btn-sm h-10 min-h-10 px-4 ${sort === option.value ? "btn-secondary" : "btn-ghost border-base-300 bg-base-100"}`}
          >
            {option.label}
          </button>
        ))}
        {users.data && (
          <span className="ml-auto text-sm text-base-content/60" aria-live="polite">
            {search
              ? `${results.length} of ${all.length} users`
              : `${all.length === 1 ? "1 user" : `${all.length} users`} · ${joinedThisWeek} joined this week`}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {users.isPending ? (
          Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-20 rounded-box" />)
        ) : users.isError ? (
          <LoadError what="users" onRetry={() => users.refetch()} />
        ) : all.length === 0 ? (
          <EmptyState title="No users yet" description="When someone signs up, they show up here." />
        ) : results.length === 0 ? (
          <EmptyState title="No users match" description="Try another name or email." />
        ) : (
          visible.map((user, i) => (
            <div key={user.id} ref={i === visible.length - 1 ? (lastItemRef as React.Ref<HTMLDivElement>) : undefined}>
              <UserRow user={user} shared={sharedBy[user.id] ?? 0} />
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
