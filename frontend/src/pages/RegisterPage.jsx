import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created! Please log in.");
        navigate("/login");
      } else {
        toast.error(data.detail || "Registration failed.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
        <input
          className="w-full p-2 rounded bg-slate-700 text-white"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full p-2 rounded bg-slate-700 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          className="w-full p-2 rounded bg-slate-700 text-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 py-2 rounded text-white font-semibold"
        >
          Register
        </button>
        <p className="text-sm text-gray-400 text-center mt-2">
          Already have an account?{" "}
          <span className="text-blue-400 cursor-pointer" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
