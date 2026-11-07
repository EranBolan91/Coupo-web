import { CouponBrand } from "../types/CouponBrandType";
import { Coupon } from "../types/CouponType";
import { storeSlug } from "./stores";

// Two brand names are the same brand when they make the same store link ("H&M" = "h-m", "Nike" = "nike").
export const sameBrand = (a: string, b: string) => storeSlug(a) === storeSlug(b);

// Checks a brand name a user types in when it isn't in the Brands list. Returns the problem, or undefined.
// "/" is not allowed because the logo is saved as Brands/{name}.{ext} in Storage.
export const newBrandError = (text: string) => {
  const name = text.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return "A brand name is 2 to 40 characters";
  if (!storeSlug(name)) return "Use letters or numbers in the brand name";
  if (/[/\\]/.test(name)) return "A brand name can't contain / or \\";
  return undefined;
};

export interface NewBrand {
  name: string; // as written on the newest coupon
  coupons: Coupon[]; // the store coupons of this brand that have no logo (any spelling with the same store link)
  logo?: CouponBrand; // set when the brand is in the Brands list but these coupons don't show its logo yet
}

// Brands of store coupons that have no logo: brands not in the Brands list yet, or in it but some of
// their coupons still show no logo (e.g. the logo was added on the "Add brands" page).
export const findNewBrands = (coupons: Coupon[], brands: CouponBrand[]): NewBrand[] => {
  const known = new Map(brands.map((brand) => [storeSlug(brand.brand), brand]));
  const groups = new Map<string, NewBrand>();
  for (const coupon of coupons) {
    const slug = storeSlug(coupon.name ?? "");
    // A coupon with a logo is done (a just-uploaded logo's Brands doc may still be on its way).
    if (!slug || coupon.imgUrl) continue;
    const logo = known.get(slug);
    const group = groups.get(slug) ?? {
      name: coupon.name.trim(),
      coupons: [],
      logo,
    };
    group.coupons.push(coupon);
    groups.set(slug, group);
  }
  return [...groups.values()].sort((a, b) => b.coupons.length - a.coupons.length || a.name.localeCompare(b.name));
};
