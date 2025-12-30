import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShopLayout from "./layout/ShopLayout";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
