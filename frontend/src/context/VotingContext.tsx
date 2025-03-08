import { removeUserVote } from "../database/databaseCalls";
import { ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserAuth } from "../auth/AuthProvider";
import { getUserVotes } from "../logic/logic";
import { Vote } from "../types/VoteType";
import { createContext } from "react";

type VotingContextType = {
  userVotes: Vote;
  removeVoteFromCoupon: (couponID: string, voteType: boolean) => void;
};

export const VotingCouponsContext = createContext<VotingContextType | null>(null);

export const VotingContextProvider = ({ children }: { children: ReactNode }) => {
  const [userVotes, setUserVotes] = useState<Vote>({ dislikes: [], likes: [] });
  const { userDocument } = UserAuth();

  const { data, isSuccess, isFetching } = useQuery<Vote>({
    queryKey: ["userVotes"],
    queryFn: () => getUserVotes(userDocument?.userUID!),
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUserVotes(data);
    }
  }, [isSuccess, data]);

  const removeVoteFromCoupon = async (couponID: string, voteType: boolean) => {
    if (voteType === true) {
      if (userVotes?.likes !== undefined) {
        removeUserVote(userDocument?.userUID!, couponID, voteType)
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
