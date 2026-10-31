import { DEFAULT_DESCRIPTION, SITE_URL } from "../config/site";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export interface PageMeta {
  // Without " | Coupo"; it's added here.
  title: string;
  description?: string;
  // A brand logo for link previews.
  image?: string;
}

const setMeta = (attribute: "name" | "property", key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const setCanonical = (href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = href;
};

let firstPath: string | null = null;

// Sets the browser title, description, canonical link and link-preview tags for this page.
// Pages that search engines can reach directly (coupon, store, category) also get these tags from
// the couponPreview Cloud Function, which uses the same wording. The canonical link never has the
// query string, so filtered and shared (?ref=) links count as the plain page.
// Pass null while the page's data is loading to leave the tags alone.
const usePageMeta = (meta: PageMeta | null) => {
  const { pathname } = useLocation();
  const title = meta?.title;
  const description = meta?.description || DEFAULT_DESCRIPTION;
  const image = meta?.image;

  useEffect(() => {
    if (!title) return;
    if (firstPath === null) firstPath = pathname;
    // Structured data from the server describes the first page only; drop it after moving on.
    if (pathname !== firstPath) {
      document.head.querySelectorAll('script[type="application/ld+json"]').forEach((tag) => tag.remove());
    }
    const url = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;
    document.title = title === "Coupo" ? title : `${title} | Coupo`;
    setMeta("name", "description", description);
    setCanonical(url);
    setMeta("property", "og:url", url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image || `${SITE_URL}/og-image.png`);
  }, [title, description, image, pathname]);
};

export default usePageMeta;
