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
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Prevent refetching by making data never stale
      refetchOnWindowFocus: false, // Disable refetching on focus
      refetchOnReconnect: false, // Disable refetching on network reconnect
      refetchOnMount: false, // Disab
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
