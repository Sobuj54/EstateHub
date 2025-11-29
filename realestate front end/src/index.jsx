import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import AuthProvider from "contextAPI/AuthContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
