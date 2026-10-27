import { removeUserVote } from "../database/databaseCalls";
import { ReactNode, useEffect, useState } from "react";
import { RootState } from "../redux/store/store";
import { useQuery } from "@tanstack/react-query";
import { getUserVotes } from "../logic/logic";
import { useSelector } from "react-redux";
import { Vote } from "../types/VoteType";
import { createContext } from "react";

type VotingContextType = {
  userVotes: Vote;
  removeVoteFromCoupon: (couponID: string, voteType: boolean) => void;
};

export const VotingCouponsContext = createContext<VotingContextType | null>(null);

export const VotingContextProvider = ({ children }: { children: ReactNode }) => {
  const [userVotes, setUserVotes] = useState<Vote>({ dislikes: [], likes: [] });
  const userProfile = useSelector((state: RootState) => state.profile);

  const { data, isSuccess } = useQuery<Vote>({
    queryKey: ["userVotes", userProfile.userUID],
    queryFn: () => getUserVotes(userProfile.userUID),
    enabled: userProfile.userUID !== "",
  });

  useEffect(() => {
    if (userProfile.userUID === "") {
      setUserVotes({ dislikes: [], likes: [] }); // signed out
    } else if (isSuccess && data) {
      setUserVotes(data);
    }
  }, [isSuccess, data, userProfile.userUID]);

  // voteType: true = like, false = dislike
  const removeVoteFromCoupon = async (couponID: string, voteType: boolean) => {
    const listName = voteType ? "likes" : "dislikes";
    removeUserVote(userProfile.userUID, couponID, voteType)
      .then(() => {
        setUserVotes((prevVotes) => ({
          ...prevVotes,
          [listName]: prevVotes[listName].filter((couponVote) => couponVote.id !== couponID),
        }));
      })
      .catch((error: any) => {
        console.error(error.message);
      });
  };

  return (
    <VotingCouponsContext.Provider value={{ userVotes, removeVoteFromCoupon }}>{children}</VotingCouponsContext.Provider>
  );
};
