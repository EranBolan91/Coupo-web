import { PiArrowRightBold, PiPencilSimpleBold, PiPlusBold, PiUserCircleFill } from "react-icons/pi";
import { sharerPath } from "../../logic/sharers";
import { ModalPersonalInfo } from "./components/PersonalInfo/ModalPersonalInfo";
import { getUserCoupons } from "../../database/databaseCalls";
import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import ExpireCoupons from "./components/ExpireCoupons";
import ChangePassword from "./components/ChangePassword";
import useWishlist from "../../hooks/useWishlist";
import { useQuery } from "@tanstack/react-query";
import { Coupon } from "../../types/CouponType";
import MyCoupons from "./components/MyCoupons";
import Wishlist from "./components/Wishlist";
import { Link } from "react-router-dom";
import Tabs from "./components/Tabs";
import { useState } from "react";

// A stat shown as a small stamped ticket.
const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex min-w-[7.5rem] flex-col rounded-box bg-base-200 px-5 py-4">
    <span className="font-display text-4xl font-extrabold leading-none tracking-tight">{value}</span>
    <span className="mt-1.5 text-sm font-semibold text-base-content/60">{label}</span>
  </div>
);

const Profile = () => {
  const userDocument = useCurrentUser();
  const [editing, setEditing] = useState(false);

  // Same query (and cache) as the My coupons tab.
  const { data: myCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ["usercoupons"],
    queryFn: () => getUserCoupons(userDocument?.userUID ?? ""),
  });
  const { wishlists = [] } = useWishlist(userDocument?.userUID);
  const likesReceived = myCoupons.reduce((sum, coupon) => sum + (coupon.likes ?? 0), 0);

  if (!userDocument) return null;

  const tabs = [
    { label: "My coupons", count: myCoupons.length, content: <MyCoupons /> },
    { label: "Saved", count: wishlists.length, content: <Wishlist /> },
    { label: "Expired", content: <ExpireCoupons /> },
    {
      label: "Account",
      content: (
        <>
          <PersonalInfo currentUser={userDocument} />
          <ChangePassword email={userDocument.email} />
        </>
      ),
    },
  ];

  return (
    <>
      <header className="relative bg-base-100">
        <div className="page-container flex flex-col gap-8 py-10 md:py-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="size-20 shrink-0 -rotate-3 overflow-hidden rounded-box bg-base-200 ring-4 ring-primary md:size-24">
              {userDocument.imageURL ? (
                <img src={userDocument.imageURL} alt="" className="size-full object-cover" />
              ) : (
                <PiUserCircleFill className="size-full text-base-content/30" aria-hidden />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
                Hi, {userDocument.firstName || "there"}
              </h1>
              <p className="mt-2 truncate text-base-content/70">{userDocument.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-ghost h-12 min-h-12 border-2 border-base-300 px-5" onClick={() => setEditing(true)}>
              <PiPencilSimpleBold className="size-4" aria-hidden />
              Edit profile
            </button>
            <Link to="/addcoupon" className="btn btn-primary h-12 min-h-12 px-5">
              <PiPlusBold className="size-4" aria-hidden />
              Share a coupon
            </Link>
          </div>
        </div>
        <div className="page-container flex gap-3 overflow-x-auto pb-10">
          <Stat value={myCoupons.length} label="Coupons shared" />
          <Stat value={likesReceived} label="Likes received" />
          <Stat value={wishlists.length} label="Saved" />
          {myCoupons.length > 0 && (
            <Link
              to={sharerPath(userDocument.userUID)}
              className="flex min-w-[10rem] shrink-0 items-center gap-2 self-stretch rounded-box border-2 border-dashed border-base-300 px-5 text-sm font-bold transition-colors hover:border-base-content"
            >
              Your public page
              <PiArrowRightBold aria-hidden />
            </Link>
          )}
        </div>
        <div className="perf-x w-full text-base-300" aria-hidden="true" />
      </header>

      <section className="page-container py-10">
        <Tabs tabs={tabs} />
      </section>

      <ModalPersonalInfo
        key={`${userDocument.userUID}-${editing}`}
        currentUser={userDocument}
        open={editing}
        onClose={() => setEditing(false)}
      />
    </>
  );
};

export default Profile;
