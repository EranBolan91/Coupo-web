import { ComponentType, LazyExoticComponent, Suspense, lazy } from "react";

// Shown while a page's code downloads.
const PageLoading = () => (
  <div className="page-container flex justify-center py-24" role="status">
    <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
    <span className="sr-only">Loading</span>
  </div>
);

// None of these pages take props.
const withLoading = (Page: LazyExoticComponent<ComponentType>) => {
  const LazyPage = () => (
    <Suspense fallback={<PageLoading />}>
      <Page />
    </Suspense>
  );
  return LazyPage;
};

// Pages for signed-in users and admins, loaded only when opened, so visitors arriving from search
// download less on their first page.
export const AddCouponPage = withLoading(lazy(() => import("../components/addCoupon/AddCouponPage")));
export const Profile = withLoading(lazy(() => import("./profile/Profile")));
export const SignUp = withLoading(lazy(() => import("../auth/components/SignUp")));
export const Login = withLoading(lazy(() => import("../auth/components/Login")));
export const Brand = withLoading(lazy(() => import("./admin/components/Brand")));
export const AdminPage = withLoading(lazy(() => import("./admin/Admin")));
export const AdminDashboard = withLoading(lazy(() => import("./admin/AdminDashboard")));
