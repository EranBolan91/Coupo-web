import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VotingContextProvider } from "./context/VotingContext.tsx";
import ErrorBoundary from "./errorBoundary/ErrorBoundary.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import { store } from "./redux/store/store.ts";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import React from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Data never goes stale: refresh it yourself after a change (invalidateQueries)
      refetchOnWindowFocus: false,
      // Never refetch data that loaded fine, but do retry a request that failed, so one failure
      // doesn't leave a page empty until a full reload.
      refetchOnReconnect: (query) => query.state.status === "error",
      refetchOnMount: (query) => query.state.status === "error",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={"There was an error"}>
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <VotingContextProvider>
                <App />
              </VotingContextProvider>
            </AuthProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
