import { getMonthLeaderboard, getSharerStats } from "../database/sharerStats";
import { useQuery } from "@tanstack/react-query";
import { monthKey } from "../logic/points";

// One sharer's points (SharerStats/{uid}); null data = no points yet.
export const useSharerStats = (userID?: string) =>
  useQuery({
    queryKey: ["sharerStats", userID],
    queryFn: () => getSharerStats(userID as string),
    enabled: !!userID,
  });

// "Top sharers this month", most points first. The month is in the key so a new month loads fresh.
export const useMonthLeaderboard = () =>
  useQuery({
    queryKey: ["monthLeaderboard", monthKey()],
    queryFn: () => getMonthLeaderboard(),
  });
