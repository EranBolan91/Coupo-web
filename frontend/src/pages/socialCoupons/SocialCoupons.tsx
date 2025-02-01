import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import useDebounce from "../../hooks/useDebounce";
import { useEffect, useState } from "react";
import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { collectionsList } from "../../../firebaseCollections";
import { db } from "../../database/databaseConfig";
import { Coupon } from "../../types/Types";
import { AnimatePresence, inView, motion } from "motion/react";
import CouponCard from "../coupons/components/CouponCard";

const getSocialCoupons = async ({ pageParam = null }: { pageParam?: QueryDocumentSnapshot<DocumentData> | null }) => {
  const coupons: Coupon[] = [];
  const pageSize = 3;
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

const SocialCoupons = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debounceSearch = useDebounce(searchQuery, 700);
  const { ref, inView } = useInView();

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: getSocialCoupons,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
  });

  console.log(data);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  return (
    <section className="w-full">
      <div className="w-full h-[520px] bg-[url('https://plus.unsplash.com/premium_photo-1728897798011-3de899171c76?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-no-repeat bg-center flex flex-col justify-center items-center ">
        <div>
          <h1 className="text-white text-center xl:text-5xl lg:text-4xl md:text-3xl sm:text-2xl xs:text-xl font-semibold bg-gray-800 p-2 bg-opacity-40 rounded-sm">
            Discover Your new Social Coupon
          </h1>
        </div>
        <div className="w-full mx-auto">
          <form>
            <div className="xl:w-1/2 lg:w-[60%] md:w-[70%] sm:w-[70%] xs:w-[90%] mx-auto flex gap-2 md:mt-6 xs:mt-4 ">
              <input type="text" className="border border-gray-400 w-full p-2 rounded-md text-xl pl-2" placeholder="" />
              <button
                type="submit"
                className="px-[10px] p-[10px] bg-blue-500 text-lg text-white rounded-md font-semibold"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <div className="grid grid-rows-1 md:grid-cols-12 lg:grid-cols-12 gap-y-10 md:gap-10 justify-center items-center mt-11 justify-items-center">
          <AnimatePresence>
            {data &&
              data.pages.map((coupon: Coupon, index: number) => {
                if (index === data.pages.length - 1) {
                  return (
                    <div key={coupon.id} className="flex justify-center col-span-12 md:col-span-4 w-full">
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CouponCard innerRef={ref} coupon={coupon} key={index} />
                      </motion.div>
                    </div>
                  );
                } else {
                  return (
                    <div key={coupon.id} className="flex justify-center col-span-12 md:col-span-4 w-full">
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CouponCard coupon={coupon} key={index} />
                      </motion.div>
                    </div>
                  );
                }
              })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SocialCoupons;
