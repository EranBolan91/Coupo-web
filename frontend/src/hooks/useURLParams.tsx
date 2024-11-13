import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const useURLParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Function to get a parameter value
  const getParam = useCallback(
    (key: string): string[] | null => {
      return searchParams.getAll(key);
    },
    [searchParams]
  );

  // Function to set or add a parameter
  const setParam = useCallback(
    (key: string, value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (newParams.has(key)) {
        newParams.append(key, value);
      } else {
        newParams.set(key, value);
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Function to remove a parameter
  const removeParam = useCallback(
    (key: string) => {
      // const newParams = new URLSearchParams(searchParams);
      // newParams.delete(key);
      const categories = searchParams.getAll("category");
      const categoryValue = key.split("=")[1];
      // Clear all existing 'category' parameters from the URL
      searchParams.delete("category");

      // Add back only the 'category' values you want to keep
      categories
        .filter((value) => value !== categoryValue) // Remove 'food' specifically
        .forEach((value) => searchParams.append("category", value));
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  return { getParam, setParam, removeParam };
};

export default useURLParams;
