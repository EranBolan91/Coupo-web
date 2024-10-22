import { getUserLikesVote } from "../database/databaseCalls";

export const getUserVotes = async (userID: string) => {
  const data = await getUserLikesVote(userID);
};
