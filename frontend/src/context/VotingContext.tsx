import { removeUserVote } from "../database/databaseCalls";
import { ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserAuth } from "../auth/AuthProvider";
import { getUserVotes } from "../logic/logic";
import { VoteObject } from "../types/Types";
import { createContext } from "react";
import { User } from "firebase/auth";

type VotingContextType = {
  userVotes: VoteObject;
  removeVoteFromCoupon: (couponID: string, voteType: boolean) => void;
};

export const VotingCouponsContext = createContext<VotingContextType | null>(null);

export const VotingContextProvider = ({ children }: { children: ReactNode }) => {
  const [userVotes, setUserVotes] = useState<VoteObject>({ dislikes: [], likes: [] });
  const { user }: { user: User } = UserAuth();

  const { data, isSuccess, isFetching } = useQuery<VoteObject>({
    queryKey: ["userVotes"],
    queryFn: () => getUserVotes(user.uid),
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUserVotes(data);
    }
  }, [isSuccess, data]);

  const removeVoteFromCoupon = async (couponID: string, voteType: boolean) => {
    if (voteType === true) {
      if (userVotes?.likes !== undefined) {
        removeUserVote(user.uid, couponID, voteType)
          .then(() => {
            setUserVotes((prevVotes) => ({
              ...prevVotes,
              likes: prevVotes.likes.filter((couponVote) => couponVote.id !== couponID),
            }));
          })
          .catch((error: any) => {
            throw new Error(error.message);
          });
      }
    }
  };

  return (
    <>
      {isFetching !== true ? (
        <VotingCouponsContext.Provider value={{ userVotes, removeVoteFromCoupon }}>
          {children}
        </VotingCouponsContext.Provider>
      ) : null}
    </>
  );
};
