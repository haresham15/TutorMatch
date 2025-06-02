
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logout, getUserRole } from "../auth";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getUserRole();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold tracking-tight">TutorMatch</Link>
      <div className="space-x-4">
        {isLoggedIn() ? (
          <>
            {role === "student" && (
              <>
                <Link to="/student/dashboard" className="hover:text-gray-300">Dashboard</Link>
              </>
            )}
            {role === "tutor" && (
              <>
                <Link to="/tutor/dashboard" className="hover:text-gray-300">Dashboard</Link>
              </>
            )}
            <Link to="/match" className="hover:text-gray-300">Matches</Link>
            <button onClick={handleLogout} className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

