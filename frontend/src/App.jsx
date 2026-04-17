import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AiDashboardPage from './pages/AiDashboardPage';
import OrbitPage from './pages/OrbitPage';
import RoleForumPage from './pages/RoleForumPage';
import CompanyForumPage from './pages/CompanyForumPage';
import MockInterviewPage from './pages/MockInterviewPage';
import Navbar from './components/Navbar';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/ai-dashboard" element={<AiDashboardPage />} />
        <Route path="/orbit/:orbitId" element={<OrbitPage />} />
        <Route path="/mock-interview/:orbitId" element={<MockInterviewPage />} />
        <Route path="/forum/:orbitId" element={<RoleForumPage />} />
        <Route path="/community/:orbitId/:companyId" element={<CompanyForumPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface font-body overflow-x-hidden relative pt-20">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
