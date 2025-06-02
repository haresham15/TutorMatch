
import React, { useEffect, useState } from "react";

export default function ChatBox({ currentUserId, targetUserId, token, fetchMessages, sendMessage }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await fetchMessages(token, targetUserId);
        setMessages(msgs);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
    loadMessages();
  }, [targetUserId, token, fetchMessages]);

  const handleSend = async () => {
    if (text.trim()) {
      await sendMessage(token, targetUserId, text);
      setText("");
      const msgs = await fetchMessages(token, targetUserId);
      setMessages(msgs);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h3 className="text-lg font-semibold mb-2">Messages</h3>
      <div className="h-40 overflow-y-scroll mb-2 border p-2 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <strong>{msg.senderId === currentUserId ? "You" : "Them"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Type your message..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600">
          Send
        </button>
      </div>
    </div>
  );
}
