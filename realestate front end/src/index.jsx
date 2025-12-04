import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import AuthProvider from "contextAPI/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const container = document.getElementById("root");
const root = createRoot(container);

const queryClient = new QueryClient();

root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
