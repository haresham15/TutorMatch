// src/components/LogoutButton.jsx

import { logout } from "../auth";

export default function LogoutButton({ onLogout }) {
  const handleClick = () => {
    logout();
    onLogout?.(); // call optional callback if provided
  };

  return (
    <button
      onClick={handleClick}
      className="text-white hover:text-red-400 transition duration-150"
    >
      Logout
    </button>
  );
}
