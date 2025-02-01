import {
  QueryDocumentSnapshot,
  DocumentData,
  query,
  collection,
  orderBy,
  startAfter,
  limit,
  getDocs,
} from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "../database/databaseConfig";
import { Coupon } from "../types/Types";

type Props = {
  collection: string;
};

const getSocialCoupons = async ({ pageParam = null }: { pageParam?: QueryDocumentSnapshot<DocumentData> | null }) => {
  const coupons: Coupon[] = [];
  const pageSize = 10;
  let fetchQuery;

  if (pageParam === null) {
    fetchQuery = query(
      collection(db, collectionsList.coupons),
      orderBy("createdAt", "desc"),
      ...(pageParam ? [startAfter(pageParam)] : []),
      limit(3)
    );
  } else {
    fetchQuery = query(
      collection(db, collectionsList.coupons),
      orderBy("createdAt", "desc"),
      startAfter(pageParam),
      limit(pageSize)
    );
  }

  const documentSnapshots = await getDocs(fetchQuery);
  documentSnapshots.docs.forEach((doc) => {
    const coupon = { id: doc.id, ...doc.data() };
    coupons.push(coupon as Coupon);
  });

  return {
    data: coupons,
    nextPageParam:
      documentSnapshots.docs.length === pageSize ? documentSnapshots.docs[documentSnapshots.docs.length - 1] : null,
  };
};

const useFetchCoupons = ({ collection }: Props) => {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: getSocialCoupons,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
  });

  return { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status };
};

export default useFetchCoupons;
