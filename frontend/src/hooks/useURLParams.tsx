import { useCallback } from "react";

const useURLParams = () => {
  // Function to get a parameter value
  const getParam = useCallback((key: string): string[] | null => {
    const params = new URLSearchParams(window.location.search);
    return params.getAll(key);
  }, []);

  // Function to set a parameter
  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (params.has(key) === true) {
      params.append(key, value);
      params.values();
    } else {
      params.set(key, value);
    }
    // Update the URL without reloading the page
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, []);

  // Function to remove a parameter
  const removeParam = useCallback((param: string) => {
    const params = new URLSearchParams(window.location.search);
    const url = params
      .toString()
      .split("&")
      .filter((p) => p !== param)
      .join("&");
    console.log(url);

    // Update the URL without reloading the page
    window.history.replaceState({}, "", `${window.location.pathname}?${url}`);
  }, []);

  return { getParam, setParam, removeParam };
};

export default useURLParams;
