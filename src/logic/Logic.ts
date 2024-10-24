import { getUserDislikesVotes, getUserLikesVotes } from "../database/databaseCalls";
import { Coupon, VoteObject } from "../types/Types";

export const getUserVotes = async (userID: string): Promise<VoteObject> => {
  const userVotesObj: VoteObject = {
    likes: [],
    dislikes: [],
  };
  const userLikes: Coupon[] = await getUserLikesVotes(userID);
  const userDislikes: Coupon[] = await getUserDislikesVotes(userID);

  userLikes.map((userLike) => userVotesObj.likes.push(userLike));
  userDislikes.map((userDislike) => userVotesObj.dislikes.push(userDislike));
  return userVotesObj;
};
