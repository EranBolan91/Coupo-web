import { removeUserVote, saveUserVote } from "../database/databaseCalls";
import { ReactNode, useEffect, useState } from "react";
import { RootState } from "../redux/store/store";
import { useQuery } from "@tanstack/react-query";
import { Coupon } from "../types/CouponType";
import { getUserVotes } from "../logic/logic";
import { useSelector } from "react-redux";
import { Vote } from "../types/VoteType";
import { createContext } from "react";
import { Timestamp } from "firebase/firestore";

export type VoteKind = "likes" | "dislikes";

type VotingContextType = {
  userVotes: Vote;
  // The current user's vote on a coupon, or null.
  getUserVote: (couponID: string) => VoteKind | null;
  // Adds the vote, or removes it if it's already there. Voting one way removes the other vote
  // (the countVote Cloud Function enforces the same thing). Returns the coupon with updated counts.
  toggleVote: (coupon: Coupon, kind: VoteKind) => Promise<Coupon>;
  // Answer to "Did it work?": yes = like, no = dislike. Unlike toggleVote it never removes a vote;
  // giving the same answer again re-saves it, which refreshes "last worked" on the coupon.
  reportResult: (coupon: Coupon, worked: boolean) => Promise<Coupon>;
};

export const VotingCouponsContext = createContext<VotingContextType | null>(null);

const emptyVotes: Vote = { likes: [], dislikes: [] };

export const VotingContextProvider = ({ children }: { children: ReactNode }) => {
  const [userVotes, setUserVotes] = useState<Vote>(emptyVotes);
  const userProfile = useSelector((state: RootState) => state.profile);

  const { data, isSuccess } = useQuery<Vote>({
    queryKey: ["userVotes", userProfile.userUID],
    queryFn: () => getUserVotes(userProfile.userUID),
    enabled: userProfile.userUID !== "",
  });

  useEffect(() => {
    if (userProfile.userUID === "") {
      setUserVotes(emptyVotes); // signed out
    } else if (isSuccess && data) {
      setUserVotes(data);
    }
  }, [isSuccess, data, userProfile.userUID]);

  const getUserVote = (couponID: string): VoteKind | null => {
    if (userVotes.likes.some((coupon) => coupon.id === couponID)) return "likes";
    if (userVotes.dislikes.some((coupon) => coupon.id === couponID)) return "dislikes";
    return null;
  };

  const toggleVote = async (coupon: Coupon, kind: VoteKind): Promise<Coupon> => {
    const uid = userProfile.userUID;
    const other: VoteKind = kind === "likes" ? "dislikes" : "likes";
    const current = getUserVote(coupon.id);
    const updated: Coupon = { ...coupon };
    const without = (list: Coupon[]) => list.filter((votedCoupon) => votedCoupon.id !== coupon.id);

    if (current === kind) {
      await removeUserVote(uid, coupon.id, kind === "likes");
      updated[kind] = Math.max(0, updated[kind] - 1);
      setUserVotes((prev) => ({ ...prev, [kind]: without(prev[kind]) }));
      return updated;
    }

    await saveUserVote(coupon, uid, kind === "likes");
    updated[kind] = updated[kind] + 1;
    if (current === other) {
      await removeUserVote(uid, coupon.id, other === "likes");
      updated[other] = Math.max(0, updated[other] - 1);
    }
    setUserVotes((prev) => ({ ...prev, [kind]: [...without(prev[kind]), coupon], [other]: without(prev[other]) }));
    return updated;
  };

  const reportResult = async (coupon: Coupon, worked: boolean): Promise<Coupon> => {
    const kind: VoteKind = worked ? "likes" : "dislikes";
    let updated: Coupon = coupon;
    if (getUserVote(coupon.id) === kind) {
      await saveUserVote(coupon, userProfile.userUID, worked);
    } else {
      updated = await toggleVote(coupon, kind);
    }
    return { ...updated, [worked ? "lastWorkedAt" : "lastFailedAt"]: Timestamp.now() };
  };

  return (
    <VotingCouponsContext.Provider value={{ userVotes, getUserVote, toggleVote, reportResult }}>{children}</VotingCouponsContext.Provider>
  );
};
