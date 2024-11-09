import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const useTest = () => {
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
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(key);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  return { getParam, setParam, removeParam };
};

export default useTest;
