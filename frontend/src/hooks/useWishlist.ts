import { getUserWishlist } from "../database/wishlist";
import { useQuery } from "@tanstack/react-query";

const useWishlist = (userId: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: () => getUserWishlist(userId),
  });

  return { data, isLoading, isError, error };
};

export default useWishlist;
