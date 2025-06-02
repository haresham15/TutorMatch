import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentRegister from "./pages/StudentRegister";
import TutorRegister from "./pages/TutorRegister";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import MatchView from "./pages/MatchView";

import ProtectedRoute from "./components/ProtectedRoute";
import AddRoleRoute from "./components/AddRoleRoute";
import Navbar from "./components/Navbar";
import "./styles.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white font-sans">
      <Navbar />
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/tutor/register" element={<TutorRegister />} />
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/tutor/dashboard" element={<ProtectedRoute role="tutor"><TutorDashboard /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute role="admin"><MatchView /></ProtectedRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
