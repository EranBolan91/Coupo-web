import { getReports } from "../database/reports";
import { useQuery } from "@tanstack/react-query";

// All reports (admins only: the rules deny everyone else, so pass enabled = isAdmin outside admin pages).
const useReports = (enabled = true) => useQuery({ queryKey: ["reports"], queryFn: getReports, enabled });

export default useReports;
