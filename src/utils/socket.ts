import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(window.location.origin, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      this.socket.on("connect", () => {
        console.log("Connected to socket server");
        const userId = localStorage.getItem("userId");
        if (userId) {
          this.socket?.emit("register-user", userId);
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from socket server:", reason);
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket || this.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat
  joinChat(chatId: string) {
    this.socket?.emit("join-chat", chatId);
  }

  sendChatMessage(chatId: string, text: string, receiverId: string, senderName: string) {
    const userId = localStorage.getItem("userId");
    this.socket?.emit("send-chat-message", {
      chatId,
      senderId: userId,
      receiverId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on("new-chat-message", callback);
  }

  // Cinema
  joinCinema(roomId: string) {
    this.socket?.emit("join-cinema", roomId);
  }

  sendCinemaControl(roomId: string, action: 'play' | 'pause' | 'seek' | 'source', time: number, sourceType?: string | null, url?: string) {
    const userId = localStorage.getItem("userId");
    this.socket?.emit("cinema-control", { roomId, action, time, userId, sourceType, url });
  }

  onCinemaSync(callback: (data: any) => void) {
    this.socket?.on("cinema-sync", callback);
  }

  // Location
  updateLocation(latitude: number, longitude: number) {
    const userId = localStorage.getItem("userId");
    this.socket?.emit("update-location", { userId, latitude, longitude, timestamp: new Date().toISOString() });
  }

  onFriendLocationUpdate(callback: (data: any) => void) {
    this.socket?.on("friend-location-update", callback);
  }

  // Status
  onUserStatusChange(callback: (data: any) => void) {
    this.socket?.on("user-status-change", callback);
  }
}

export const socketService = new SocketService();
