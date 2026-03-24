import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import { OrderProvider } from "./context/OrderContext.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <OrderProvider> {/* ⬅️ ครอบ App ด้วย OrderProvider */}
          <App />
        </OrderProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);