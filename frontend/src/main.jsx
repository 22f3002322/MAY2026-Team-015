import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import useThemeStore from "./store/themeStore";
import "./index.css";

// Initialize theme on app load
useThemeStore.getState().initTheme();

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          duration={3000}
          theme={useThemeStore.getState().getEffectiveTheme()}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);