import React, { useEffect, useState } from "react";
import { getToken } from "../auth";
import { getStudent, getAllMatches, sendMessage, fetchMessages } from "../api";
import ChatBox from "../components/ChatBox";

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [matchedTutor, setMatchedTutor] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = getToken();

    async function fetchData() {
      const student = await getStudent(token);
      setStudentData(student);

      if (student?.matched_tutor) {
        const matches = await getAllMatches(token);
        const tutor = matches.find(t => t.id === student.matched_tutor);
        setMatchedTutor(tutor);

        const msgHistory = await fetchMessages(token, tutor.id);
        setMessages(msgHistory);
      }
    }

    fetchData();
  }, []);

  const handleSendMessage = async (text) => {
    const token = getToken();
    const newMsg = await sendMessage(token, matchedTutor.id, text);
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-semibold">Student Dashboard</h2>

      {studentData && (
        <div className="p-4 border rounded bg-gray-50">
          <p><strong>Name:</strong> {studentData.name}</p>
          <p><strong>Address:</strong> {studentData.address}</p>
          <p><strong>Career Interests:</strong> {studentData.career_interests}</p>
          <p><strong>Overall Score:</strong> {studentData.overall_score}</p>
        </div>
      )}

      {matchedTutor ? (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Matched Tutor</h3>
          <div className="p-4 border rounded bg-white">
            <p><strong>Name:</strong> {matchedTutor.name}</p>
            <p><strong>Email:</strong> {matchedTutor.contact_info}</p>
            <p><strong>Address:</strong> {matchedTutor.address}</p>
            <p><strong>Experience:</strong> {matchedTutor.experience}</p>
            <a
              href={matchedTutor.calendly_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 underline"
            >
              Book a meeting via Calendly
            </a>
          </div>

          <ChatBox messages={messages} onSend={handleSendMessage} />
        </div>
      ) : (
        <p>No tutor matched yet. Please wait for assignment.</p>
      )}
    </div>
  );
}
