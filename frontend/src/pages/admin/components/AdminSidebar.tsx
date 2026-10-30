import { PiChartBarBold, PiChartLineUpBold, PiFlagBold, PiFoldersBold, PiListBulletsBold, PiPlusBold, PiTagBold } from "react-icons/pi";
import useReports from "../../../hooks/useReports";
import { NavLink } from "react-router-dom";
import React from "react";

const links = [
  { to: "/admin", label: "Dashboard", icon: PiChartBarBold },
  { to: "/admin/analytics", label: "Analytics", icon: PiChartLineUpBold },
  { to: "/admin/add", label: "Add coupon", icon: PiPlusBold },
  { to: "/admin/coupons", label: "Coupons", icon: PiListBulletsBold },
  { to: "/admin/reports", label: "Reports", icon: PiFlagBold },
  { to: "/admin/categories", label: "Categories", icon: PiFoldersBold },
  { to: "/admin/addBrand", label: "Add brands", icon: PiTagBold },
];

// Admin pages: side menu on large screens, pill row on small ones, page content on the right.
export const AdminLayout = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const { data: reports } = useReports();
  const openReports = new Set(reports?.map((report) => report.couponID)).size;

  return (
    <div className="page-container grid grid-cols-[minmax(0,1fr)] gap-8 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
      <nav aria-label="Admin" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 hidden text-xs font-bold uppercase tracking-wider text-base-content/50 lg:block">Admin</p>
        <ul className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `flex h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-btn px-4 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
                  }`
                }
              >
                <Icon className="size-5" aria-hidden />
                {label}
                {to === "/admin/reports" && openReports > 0 && (
                  <span className="ml-auto rounded-full bg-error px-2 py-0.5 text-xs font-bold text-error-content">
                    {openReports}
                    <span className="sr-only"> coupons reported</span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight">{title}</h1>
        <p className="mt-3 max-w-[60ch] text-base-content/70">{description}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
