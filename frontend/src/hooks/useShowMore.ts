import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

// Shows a long list a page at a time: the next page appears when the last item scrolls near the screen.
// Changing resetKey (e.g. the search text) goes back to the first page.
const useShowMore = <T>(items: T[], resetKey: string, pageSize = 12) => {
  const [count, setCount] = useState(pageSize);
  const { ref, inView } = useInView({ rootMargin: "400px" });

  useEffect(() => setCount(pageSize), [resetKey, pageSize]);

  useEffect(() => {
    if (inView && count < items.length) setCount((current) => current + pageSize);
  }, [inView, count, items.length, pageSize]);

  const hasMore = count < items.length;
  return { visible: items.slice(0, count), lastItemRef: hasMore ? ref : undefined };
};

export default useShowMore;
