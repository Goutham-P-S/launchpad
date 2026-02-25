import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
