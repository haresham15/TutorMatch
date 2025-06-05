import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function StudentRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [overallScore, setOverallScore] = useState("");
  const [careerInterests, setCareerInterests] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [courseScores, setCourseScores] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("Mathematics");
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const handleAddCourse = () => {
    if (score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }
    setCourseScores([...courseScores, { course: selectedCourse, score }]);
  };

  const handleSubmit = async () => {
    try {
      // Step 1: Register login
      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: "student" }),
      });
      if (!regRes.ok) throw new Error("Username already exists");

      // Step 2: Log in
      const loginRes = await fetch("/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      const loginData = await loginRes.json();
      const token = loginData.access_token;
      localStorage.setItem("token", token);

      // Step 3: Register student profile
      const payload = {
        username,
        password,
        name,
        overall_score: overallScore,
        career_interests: careerInterests,
        address,
        contact_info: contactInfo,
        course_scores: Object.fromEntries(courseScores.map(cs => [cs.course, cs.score]))
      };

      const res = await fetch("/api/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to register student");
      toast.success("Registration successful!");
      navigate("/student/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-slate-800 rounded-xl shadow-xl">
      <h2 className="text-3xl font-semibold mb-4 text-white">Student Registration</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2 p-2 w-full rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 p-2 w-full rounded"
      />

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="input mb-2 w-full"
      />
      <input
        type="number"
        value={overallScore}
        onChange={(e) => setOverallScore(e.target.value)}
        placeholder="GPA"
        className="input mb-2 w-full"
      />
      <input
        type="text"
        value={careerInterests}
        onChange={(e) => setCareerInterests(e.target.value)}
        placeholder="Career Interest"
        className="input mb-2 w-full"
      />
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="input mb-2 w-full"
      />
      <input
        type="email"
        value={contactInfo}
        onChange={(e) => setContactInfo(e.target.value)}
        placeholder="Email or Contact Info"
        className="input mb-4 w-full"
      />

      <div className="my-4">
        <h3 className="font-semibold text-white">Course Scores</h3>
        <select className="input mb-2 w-full" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          {['Mathematics', 'Science', 'English', 'History', 'Programming', 'Art', 'Music'].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Score"
          className="input mb-2 w-full"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
        />
        <button onClick={handleAddCourse} className="btn bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2">
          Add Course
        </button>
        <ul className="list-disc ml-6 mt-2 text-white">
          {courseScores.map((cs, idx) => (
            <li key={idx}>{cs.course}: {cs.score}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 mt-4 rounded"
      >
        Register
      </button>
    </div>
  );
}
