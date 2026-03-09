import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import CreateStartupPage from "./pages/CreateStartupPage";
import StartupDetailPage from "./pages/StartupDetailPage";
import ImproveStartupPage from "./pages/ImproveStartupPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create" element={<CreateStartupPage />} />
          <Route path="/startups/:sandboxName" element={<StartupDetailPage />} />
          <Route path="/startups/:sandboxName/improve" element={<ImproveStartupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
