import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import { AppContextProvider } from "./context/AppContext.jsx";
import { OrderProvider } from "./context/OrderContext.jsx";
import { ProductProvider } from "./context/ProductContext.jsx";
import { CouponProvider } from "./context/CouponContext.jsx";   //   เพิ่มมานี่

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <OrderProvider>
          <ProductProvider>
            <CouponProvider>   {/*   ครอบ App เพื่อให้ระบบคูปองใช้งานได้ */}
              <App />
            </CouponProvider>
          </ProductProvider>
        </OrderProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
