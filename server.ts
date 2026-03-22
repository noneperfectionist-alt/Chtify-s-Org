import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Email Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Middleware
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-welcome", async (req, res) => {
    const { email, username } = req.body;
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({ error: "Gmail credentials not configured." });
    }

    try {
      await transporter.sendMail({
        from: `"Chatify" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Welcome to Chatify! 🚀",
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #09090b; color: #fff; border-radius: 12px;">
            <h1 style="color: #6366f1;">Welcome to Chatify, ${username}!</h1>
            <p>We're excited to have you on board. Start chatting with your friends and explore the cinema together!</p>
            <p>If you have any questions, just reply to this email.</p>
            <br/>
            <p style="color: #71717a; font-size: 12px;">© 2026 Chatify Inc.</p>
          </div>
        `,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });

  app.post("/api/send-verification", async (req, res) => {
    const { email, code } = req.body;
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({ error: "Gmail credentials not configured." });
    }

    try {
      await transporter.sendMail({
        from: `"Chatify" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify your Chatify account",
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #09090b; color: #fff; border-radius: 12px;">
            <h1 style="color: #6366f1;">Verification Code</h1>
            <p>Your verification code is: <strong style="font-size: 24px; color: #fff;">${code}</strong></p>
            <p>Enter this code in the app to verify your email address.</p>
            <br/>
            <p style="color: #71717a; font-size: 12px;">© 2026 Chatify Inc.</p>
          </div>
        `,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });

  // Socket.io logic
  const users = new Map<string, string>(); // socketId -> userId

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register-user", (userId) => {
      users.set(socket.id, userId);
      io.emit("user-status-change", { userId, status: "online" });
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Chat
    socket.on("join-chat", (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("send-chat-message", (data) => {
      // data: { chatId, senderId, text, timestamp }
      io.to(`chat:${data.chatId}`).emit("new-chat-message", data);
    });

    socket.on("typing-start", (data) => {
      socket.to(`chat:${data.chatId}`).emit("user-typing", { userId: data.userId, isTyping: true });
    });

    socket.on("typing-stop", (data) => {
      socket.to(`chat:${data.chatId}`).emit("user-typing", { userId: data.userId, isTyping: false });
    });

    // Cinema Sync
    socket.on("join-cinema", (roomId) => {
      socket.join(`cinema:${roomId}`);
      console.log(`User ${socket.id} joined cinema room ${roomId}`);
    });

    socket.on("cinema-control", (data) => {
      // data: { roomId, action: 'play' | 'pause' | 'seek', time, userId }
      socket.to(`cinema:${data.roomId}`).emit("cinema-sync", data);
    });

    // WebRTC Signaling (Calls)
    socket.on("call-user", (data) => {
      // data: { userToCall, signalData, from, name }
      const targetSocketId = Array.from(users.entries()).find(([_, id]) => id === data.userToCall)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", { signal: data.signalData, from: data.from, name: data.name });
      }
    });

    socket.on("answer-call", (data) => {
      // data: { signal, to }
      const targetSocketId = Array.from(users.entries()).find(([_, id]) => id === data.to)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-accepted", data.signal);
      }
    });

    // Location Sharing
    socket.on("update-location", (data) => {
      // data: { userId, latitude, longitude, timestamp }
      socket.broadcast.emit("friend-location-update", data);
    });

    socket.on("disconnect", () => {
      const userId = users.get(socket.id);
      if (userId) {
        users.delete(socket.id);
        io.emit("user-status-change", { userId, status: "offline" });
      }
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
