
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="h-screen flex flex-col justify-center items-center text-center px-4">
      <img src="/tutorLogo.png" alt="TutorMatch Logo" className="w-64 h-64 mb-6 animate-pulse" />
      <h1 className="text-6xl font-extrabold mb-4">Learn, Grow, and Connect</h1>
      <p className="text-xl text-gray-300 mb-6">Connecting students with certified tutors through AI</p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
  onClick={() => navigate("/student/register")}
  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl"
>
  I'm a Student
</button>

<button
  onClick={() => navigate("/tutor/register")}
  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
>
  I'm a Tutor
</button>

<button
  onClick={() => navigate("/login")}
  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl"
>
  Login
</button>

      </div>
    </section>
  );
}
