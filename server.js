const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const messages = [];

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Send chat history when a new user connects
  socket.emit("chat_history", messages);

  socket.on("send_message", (data) => {
    messages.push(data);
    io.emit("receive_message", data); // Send to all users

    // 🔁 Auto-reply logic
    const userMsg = data.message.toLowerCase().trim();

    const botReplies = {
      "hi": "Hello there! 👋",
      "hii": "Hey! How's it going?",
      "hello": "Hi! Need any help?",
      "how are you": "I'm just a bot, but doing great! 😄",
      "bye": "Goodbye! Have a great day!",
      "what is your name": "I'm ChatBot 🤖, your friendly assistant.",
    };

    if (botReplies[userMsg]) {
      const botMessage = {
        message: botReplies[userMsg],
        time: new Date().toLocaleTimeString(),
        sender: "bot",
      };
      messages.push(botMessage);
      io.emit("receive_message", botMessage); // Send bot reply
      console.log("🤖 Bot replied:", botMessage.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});
