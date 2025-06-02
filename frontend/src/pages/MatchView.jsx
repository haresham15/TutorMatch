// src/pages/MatchView.jsx

import React, { useEffect, useState } from "react";
import { getAllMatches, triggerMatch, getStudent, getTutor } from "../api";

export default function MatchView() {
  const [matches, setMatches] = useState([]);

  const refreshMatches = async () => {
    const data = await getAllMatches();
    const detailed = await Promise.all(
      data.map(async (match) => {
        const student = await getStudent(match.student_id);
        const tutor = await getTutor(match.tutor_id);
        return { student, tutor };
      })
    );
    setMatches(detailed);
  };

  const handleTriggerMatch = async () => {
    await triggerMatch(); // Optionally use specific student ID
    refreshMatches();
  };

  useEffect(() => {
    refreshMatches();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Match Overview</h1>
      <button
        onClick={handleTriggerMatch}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        Trigger New Match
      </button>

      {matches.length === 0 ? (
        <p>No matches found yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((pair, index) => (
            <li key={index} className="bg-gray-100 p-4 rounded shadow">
              <p><strong>Student:</strong> {pair.student.name} — {pair.student.contact_info}</p>
              <p><strong>Tutor:</strong> {pair.tutor.name} — {pair.tutor.contact_info}</p>
              <p><strong>Meeting Link:</strong> <a className="text-blue-600 underline" href={pair.tutor.calendly_link} target="_blank" rel="noreferrer">{pair.tutor.calendly_link}</a></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
