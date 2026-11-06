import { BrandImage } from "../../pages/coupons/components/CouponCard";
import { StoreInfo, storePath } from "../../logic/stores";
import { PiArrowRightBold } from "react-icons/pi";
import { Link } from "react-router-dom";

// Store links as tiles: logo, name, number of working codes.
const StoreTiles = ({ stores }: { stores: StoreInfo[] }) => (
  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stores.map((store) => (
      <li key={store.slug}>
        <Link
          to={storePath(store.name)}
          className="group flex items-center gap-4 surface p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          <BrandImage name={store.name} src={store.imgUrl} className="size-12" />
          <span className="min-w-0 grow">
            <span className="block truncate font-display text-xl font-black tracking-tight">{store.name}</span>
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
