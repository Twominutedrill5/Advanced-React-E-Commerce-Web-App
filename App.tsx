import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./src/context/AuthContext";
import { ProductProvider } from "./src/context/ProductContext";
import Home from "./src/pages/Home";
import Register from "./src/pages/Register";
import Login from "./src/pages/Login";
import Logout from "./src/pages/Logout";
import Cart from "./src/pages/Cart";
import Profile from "./src/pages/Profile.jsx";
import Navbar from "./src/components/Navbar";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductProvider>
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/logout" element={<Logout />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ProductProvider>
    </QueryClientProvider>
  );
}
export default App;
