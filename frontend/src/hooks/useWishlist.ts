import { getUserWishlist } from "../database/wishlist";
import { useQuery } from "@tanstack/react-query";

// Hooks must run on every render, so a missing userId disables the query instead of returning early.
const useWishlist = (userId: string | undefined) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: () => getUserWishlist(userId as string),
    enabled: userId !== undefined && userId !== "",
  });

  return { wishlists: data, isLoading: userId ? isLoading : false, isError, error };
};

export default useWishlist;
