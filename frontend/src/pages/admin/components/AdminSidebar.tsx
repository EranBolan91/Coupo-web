import { PiTagBold, PiTicketBold } from "react-icons/pi";
import { NavLink } from "react-router-dom";
import React from "react";

const links = [
  { to: "/admin", label: "Add coupon", icon: PiTicketBold },
  { to: "/admin/addBrand", label: "Add brands", icon: PiTagBold },
];

// Admin pages: side menu on large screens, pill row on small ones, page content on the right.
export const AdminLayout = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div className="page-container grid gap-8 py-10 lg:grid-cols-[14rem_1fr] lg:gap-12">
    <nav aria-label="Admin" className="lg:sticky lg:top-28 lg:self-start">
      <p className="mb-3 hidden text-xs font-bold uppercase tracking-wider text-base-content/50 lg:block">Admin</p>
      <ul className="flex gap-2 lg:flex-col">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-btn px-4 text-sm font-bold transition-colors ${
                  isActive ? "bg-primary text-primary-content" : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
                }`
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
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

export default AdminLayout;
