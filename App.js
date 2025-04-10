import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import './App.css';

const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMsg = {
        message,
        time: new Date().toLocaleTimeString(),
        sender: "user",
      };
      socket.emit("send_message", newMsg);
      setChat((prev) => [...prev, newMsg]);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("chat_history", (history) => {
      console.log("📜 History loaded:", history);
      setChat(history);
    });

    socket.on("receive_message", (data) => {
      console.log("📩 Message received:", data); // ✅ Debug line
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("chat_history");
      socket.off("receive_message");
    };
  }, []);

  return (
    <div className="App">
      <h2>Real-Time Chat</h2>
      <div className="chat-box">
        {chat.length === 0 && <p>No messages yet.</p>}
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${
              msg.sender === "bot" ? "bot-message" : "own-message"
            }`}
          >
            <div className="chat-meta">{msg.time}</div>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          placeholder="Type your message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
