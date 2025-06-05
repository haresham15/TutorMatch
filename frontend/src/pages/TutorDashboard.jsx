import React, { useEffect, useState } from "react";
import { getToken } from "../auth";
import { getTutor, getAllMatches, sendMessage, fetchMessages } from "../api";
import ChatBox from "../components/ChatBox";

export default function TutorDashboard() {
  
  const [tutorData, setTutorData] = useState(null);
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = getToken();

    async function fetchData() {
      const tutor = await getTutor(token);
      setTutorData(tutor);

      const matches = await getAllMatches(token);
      const students = matches.filter((s) => tutor.matched_students.includes(s.id));
      setMatchedStudents(students);
    }

    fetchData();
  }, []);

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    const token = getToken();
    const chat = await fetchMessages(token, student.id);
    setMessages(chat);
  };

  const handleSendMessage = async (text) => {
    const token = getToken();
    const newMsg = await sendMessage(token, selectedStudent.id, text);
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-semibold">Tutor Dashboard</h2>

      {tutorData && (
        <div className="p-4 border rounded bg-gray-50">
          <p><strong>Name:</strong> {tutorData.name}</p>
          <p><strong>Email:</strong> {tutorData.contact_info}</p>
          <p><strong>Address:</strong> {tutorData.address}</p>
          <p><strong>Experience:</strong> {tutorData.experience}</p>
          <a
            href={tutorData.calendly_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 underline"
          >
            My Calendly Link
          </a>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Matched Students</h3>
        {matchedStudents.length === 0 ? (
          <p>No matched students yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {matchedStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 border rounded bg-white cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudentClick(student)}
              >
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Career Interests:</strong> {student.career_interests}</p>
                <p><strong>Address:</strong> {student.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="mt-6">
          <h4 className="text-xl font-semibold mb-2">Chat with {selectedStudent.name}</h4>
          <ChatBox messages={messages} onSend={handleSendMessage} />
        </div>
      )}
    </div>
  );
}
