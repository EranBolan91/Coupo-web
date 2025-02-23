import { getUserWishlist } from "../database/wishlist";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const useWishlist = (userId: string | undefined) => {
  if (userId === undefined) return { wishlists: undefined, isLoading: false, isError: false, error: null };
  const [wishlists, setWishlists] = useState<string[] | undefined>(undefined);

  const { data, isLoading, isError, error, isFetched } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: () => getUserWishlist(userId),
    enabled: false,
  });

  useEffect(() => {
    if (isFetched && data) {
      setWishlists(data);
    }
  }, [isFetched]);

  return { wishlists, isLoading, isError, error };
};

export default useWishlist;
