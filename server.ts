import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT not found. Push notifications will be disabled.");
}

const db = admin.apps.length ? admin.firestore() : null;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Helper to send push notification
  const sendPushNotification = async (userId: string, title: string, body: string, data: any = {}) => {
    if (!db) return;

    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) return;

      const userData = userDoc.data();
      const tokens = userData?.fcmTokens || [];
      const settings = userData?.notificationSettings || { showPreview: true, soundEnabled: true, vibrationEnabled: true };

      if (tokens.length === 0) return;

      // Privacy mode: mask body if preview is disabled
      const finalBody = settings.showPreview ? body : "New message received";

      const message = {
        notification: {
          title,
          body: finalBody,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK", // For mobile
        },
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`Successfully sent ${response.successCount} notifications to user ${userId}`);
      
      // Cleanup invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        if (failedTokens.length > 0) {
          await db.collection("users").doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
          });
        }
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  };

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

  app.get("/api/check-username/:username", async (req, res) => {
    const { username } = req.params;
    if (!db) return res.status(503).json({ error: "Database not available" });

    try {
      const snapshot = await db.collection("users").where("username", "==", username).get();
      res.json({ available: snapshot.empty });
    } catch (error) {
      console.error("Check username error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Push API
  app.post("/api/admin/send-push", async (req, res) => {
    const { target, title, body, data } = req.body;
    // In a real app, verify admin auth here
    
    try {
      if (target === "all") {
        const usersSnapshot = await db?.collection("users").get();
        const allTokens: string[] = [];
        usersSnapshot?.forEach(doc => {
          const tokens = doc.data().fcmTokens || [];
          allTokens.push(...tokens);
        });

        if (allTokens.length > 0) {
          const message = {
            notification: { title, body },
            data: data || {},
            tokens: allTokens,
          };
          await admin.messaging().sendEachForMulticast(message);
        }
      } else {
        await sendPushNotification(target, title, body, data);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Admin push error:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  app.post("/api/send-welcome", async (req, res) => {
    const { email, username } = req.body;
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({ error: "Gmail credentials not configured." });
    }

    try {
      await transporter.sendMail({
        from: `"Nexora" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Welcome to Nexora! 🚀",
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #09090b; color: #fff; border-radius: 12px;">
            <h1 style="color: #6366f1;">Welcome to Nexora, ${username}!</h1>
            <p>We're excited to have you on board. Start chatting with your friends and explore the cinema together!</p>
            <p>If you have any questions, just reply to this email.</p>
            <br/>
            <p style="color: #71717a; font-size: 12px;">© 2026 Nexora Inc.</p>
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
        from: `"Nexora" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify your Nexora account",
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #09090b; color: #fff; border-radius: 12px;">
            <h1 style="color: #6366f1;">Verification Code</h1>
            <p>Your verification code is: <strong style="font-size: 24px; color: #fff;">${code}</strong></p>
            <p>Enter this code in the app to verify your email address.</p>
            <br/>
            <p style="color: #71717a; font-size: 12px;">© 2026 Nexora Inc.</p>
          </div>
        `,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });

  // Fallback for missing API routes to prevent returning HTML index
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Socket.io logic
  const connectedUsers = new Map<string, string>(); // socketId -> userId
  const activeChats = new Map<string, string>(); // socketId -> chatId

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register-user", (userId) => {
      connectedUsers.set(socket.id, userId);
      io.emit("user-status-change", { userId, status: "online" });
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Chat
    socket.on("join-chat", (chatId) => {
      socket.join(`chat:${chatId}`);
      activeChats.set(socket.id, chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("leave-chat", () => {
      activeChats.delete(socket.id);
    });

    socket.on("send-chat-message", async (data) => {
      // data: { chatId, senderId, receiverId, text, senderName, timestamp }
      io.to(`chat:${data.chatId}`).emit("new-chat-message", data);

      // Smart Notification Logic
      const receiverSocketId = Array.from(connectedUsers.entries()).find(([sid, uid]) => uid === data.receiverId)?.[0];
      const isReceiverInChat = receiverSocketId && activeChats.get(receiverSocketId) === data.chatId;

      if (!isReceiverInChat) {
        // Send push notification
        await sendPushNotification(
          data.receiverId,
          data.senderName || "New Message",
          data.text,
          { chatId: data.chatId, type: "message" }
        );
      }
    });

    socket.on("friend-request", async (data) => {
      // data: { fromId, toId, fromName }
      const targetSocketId = Array.from(connectedUsers.entries()).find(([_, id]) => id === data.toId)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit("new-friend-request", data);
      }
      
      await sendPushNotification(
        data.toId,
        "New Friend Request",
        `${data.fromName} sent you a friend request`,
        { type: "friend_request", fromId: data.fromId }
      );
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
      socket.to(`cinema:${data.roomId}`).emit("cinema-sync", data);
    });

    // WebRTC Signaling (Calls)
    socket.on("call-user", async (data) => {
      // data: { userToCall, signalData, from, name }
      const targetSocketId = Array.from(connectedUsers.entries()).find(([_, id]) => id === data.userToCall)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", { signal: data.signalData, from: data.from, name: data.name });
      }

      await sendPushNotification(
        data.userToCall,
        "Incoming Call",
        `${data.name} is calling you...`,
        { type: "call", from: data.from, signal: JSON.stringify(data.signalData) }
      );
    });

    socket.on("answer-call", (data) => {
      const targetSocketId = Array.from(connectedUsers.entries()).find(([_, id]) => id === data.to)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-accepted", data.signal);
      }
    });

    // Screenshot Detection
    socket.on("screenshot-detected", async (data) => {
      // data: { chatId, userId, username, targetId }
      const targetSocketId = Array.from(connectedUsers.entries()).find(([_, id]) => id === data.targetId)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit("screenshot-alert", data);
      }

      await sendPushNotification(
        data.targetId,
        "⚠ Screenshot Taken",
        `${data.username} took a screenshot of your chat`,
        { type: "screenshot", chatId: data.chatId }
      );
    });

    // Location Sharing
    socket.on("update-location", (data) => {
      socket.broadcast.emit("friend-location-update", data);
    });

    socket.on("disconnect", () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        connectedUsers.delete(socket.id);
        activeChats.delete(socket.id);
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
