import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SidebarHolder = ({ children }) => {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/admin/addBrand") {
      setShowSidebar(true);
    } else if (location.pathname === "/admin") {
      setShowSidebar(true);
    } else {
      setShowSidebar(false);
    }
  });
  return <div>{showSidebar && children}</div>;
};

export default SidebarHolder;
