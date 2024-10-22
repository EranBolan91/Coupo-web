import { useQuery } from "@tanstack/react-query";
import { UserAuth } from "../auth/AuthProvider";
import { getUserVotes } from "../logic/Logic";
import { ReactNode, useState } from "react";
import { createContext } from "react";
import { User } from "firebase/auth";

export const VotingCouponsContext = createContext([]);

export const VotingContextProvider = ({ children }: { children: ReactNode }) => {
  const { user }: { user: User } = UserAuth();
  const [coupons, setCoupons] = useState([]);

  const { data } = useQuery({
    queryKey: ["voting"],
    queryFn: () => getUserVotes(user.uid),
  });
  console.log("DATAAA", data);
  return <VotingCouponsContext.Provider value={coupons}>{children}</VotingCouponsContext.Provider>;
};
