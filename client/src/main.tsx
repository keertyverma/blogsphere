import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { ThemeProvider } from "./contexts/themeContext.tsx";
import "./index.css";
import { QueryProvider } from "./lib/react-query/QueryProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <QueryProvider>
          <App />
        </QueryProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
