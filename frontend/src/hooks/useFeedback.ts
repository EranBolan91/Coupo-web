import { getFeedback } from "../database/feedback";
import { useQuery } from "@tanstack/react-query";

// Feedback messages (admins only: the rules deny everyone else).
const useFeedback = (enabled = true) => useQuery({ queryKey: ["feedback"], queryFn: getFeedback, enabled });

export default useFeedback;
