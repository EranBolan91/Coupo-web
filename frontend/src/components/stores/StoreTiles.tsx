import { BrandImage } from "../../pages/coupons/components/CouponCard";
import { Store, storePath } from "../../logic/stores";
import { PiArrowRightBold } from "react-icons/pi";
import { Link } from "react-router-dom";

// Store links as tiles: logo, name, number of working codes.
const StoreTiles = ({ stores }: { stores: Store[] }) => (
  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stores.map((store) => (
      <li key={store.slug}>
        <Link
          to={storePath(store.name)}
          className="group flex items-center gap-4 rounded-box border-2 border-base-300 bg-base-100 p-4 transition-colors hover:border-base-content"
        >
          <BrandImage name={store.name} src={store.imgUrl} className="size-12" />
          <span className="min-w-0 grow">
            <span className="block truncate font-display text-xl font-extrabold tracking-tight">{store.name}</span>
            <span className="block text-sm text-base-content/70">
              {store.activeCount === 0
                ? "No working codes right now"
                : `${store.activeCount} working code${store.activeCount === 1 ? "" : "s"}${store.bestDiscount > 0 ? `, up to ${store.bestDiscount}% off` : ""}`}
            </span>
          </span>
          <PiArrowRightBold className="size-5 shrink-0 text-base-content/50 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </li>
    ))}
  </ul>
);

export default StoreTiles;
