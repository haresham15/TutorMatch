import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TutorRegister = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [credentials, setCredentials] = useState("");
  const [expertiseCourses, setExpertiseCourses] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [calendly, setCalendly] = useState("");
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Register the user account
      await axios.post("/api/register", {
        username,
        password,
        role: "tutor"
      });

      // Step 2: Login to get the access token
      const loginRes = await axios.post("/token", new URLSearchParams({
        username,
        password
      }));

      const token = loginRes.data.access_token;
      localStorage.setItem("token", token);

      // Step 3: Register tutor profile
      const formData = new FormData();
      formData.append("name", name);
      formData.append("experience", experience);
      formData.append("credentials", credentials);
      formData.append("expertise_courses", expertiseCourses);
      formData.append("address", address);
      formData.append("contact_info", contactInfo);
      formData.append("calendly_link", calendly);
      formData.append("resume", resume);

      await axios.post("/api/register-tutor", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Tutor registered successfully!");
      navigate("/tutor/dashboard");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-slate-800 text-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-semibold mb-6">Tutor Registration</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
          className="input"
        />
        <input
          type="text"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Experience (e.g. 3 years tutoring)"
          required
          className="input"
        />
        <input
          type="text"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
          placeholder="Credentials (e.g. Certified Tutor)"
          required
          className="input"
        />
        <input
          type="text"
          value={expertiseCourses}
          onChange={(e) => setExpertiseCourses(e.target.value)}
          placeholder="Expertise Courses (comma separated)"
          required
          className="input"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
          className="input"
        />
        <input
          type="email"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Contact Email"
          required
          className="input"
        />
        <input
          type="url"
          value={calendly}
          onChange={(e) => setCalendly(e.target.value)}
          placeholder="Calendly Link (optional)"
          className="input"
        />
        <input
          type="file"
          onChange={(e) => setResume(e.target.files[0])}
          required
          className="input text-white"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white mt-4"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default TutorRegister;
