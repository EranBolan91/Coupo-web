import {
  QueryDocumentSnapshot,
  DocumentData,
  query,
  collection,
  orderBy,
  startAfter,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { collectionsList } from "../../firebaseCollections";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "../database/databaseConfig";
import { Coupon } from "../types/Types";
import { useState } from "react";
import useDebounce from "./useDebounce";

type Props = {
  collection: string;
};

const getSocialCoupons = async ({
  pageParam = null,
  searchText = "",
}: {
  pageParam?: QueryDocumentSnapshot<DocumentData> | null | unknown;
  searchText: string;
}): Promise<{ data: Coupon[]; nextPageParam: QueryDocumentSnapshot<DocumentData> | null }> => {
  console.log("pageParam", pageParam);
  const coupons: Coupon[] = [];
  const pageSize = 10;
  let fetchQuery;

  if (pageParam === null) {
    fetchQuery = query(
      collection(db, collectionsList.coupons),
      orderBy("createdAt", "desc"),
      ...(pageParam ? [startAfter(pageParam)] : []),
      limit(pageSize)
    );
  } else {
    fetchQuery = query(
      collection(db, collectionsList.coupons),
      orderBy("createdAt", "desc"),
      startAfter(pageParam),
      limit(pageSize)
    );
  }

  if (searchText !== "") {
    fetchQuery = query(fetchQuery, where("name", "==", searchText));
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  console.log("searchQuery", searchQuery);
  const { data, error, hasNextPage, isFetching, isFetchingNextPage, status, fetchNextPage } = useInfiniteQuery<{
    data: Coupon[];
    nextPageParam: QueryDocumentSnapshot<DocumentData> | null | unknown;
  }>({
    queryKey: ["coupons", collection, searchQuery],
    queryFn: ({ pageParam = null }: { pageParam: QueryDocumentSnapshot<DocumentData> | null | unknown }) =>
      getSocialCoupons({ pageParam, searchText: searchQuery }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
  });

  const coupons: Coupon[] = data?.pages.flatMap((page) => page.data) || [];

  return { coupons, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, setSearchQuery };
};

export default useFetchCoupons;
