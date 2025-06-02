import { authHeaders } from "./auth";
const API_BASE = "/api";
export async function registerStudent(data) {
  const res = await fetch(`${API_BASE}/register-student`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function registerTutor(formData) {
  const res = await fetch(`${API_BASE}/register-tutor`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function getStudent(id) {
  const res = await fetch(`${API_BASE}/student/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getTutor(id) {
  const res = await fetch(`${API_BASE}/tutor/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getAllMatches() {
  const res = await fetch(`${API_BASE}/matches`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function triggerMatch(studentId) {
  const res = await fetch(`${API_BASE}/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ student_id: studentId }),
  });
  return res.json();
}

// message functions
export async function getMessages() {
  const res = await fetch(`${API_BASE}/messages`, {
    headers: authHeaders(),
  });
  return res.json();
}
export async function sendMessage(token, receiverId, message) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ receiver_id: receiverId, message }),
  });
  return res.json();
}
export async function fetchMessages(token, otherUserId) {
  const res = await fetch(`${API_BASE}/messages/${otherUserId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

