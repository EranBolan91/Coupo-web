import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./errorBoundary/ErrorBoundary.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import React from "react";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={"There was an error"}>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
