export type UserType = "normal" | "special_atithi" | "admin";
export type UserStatus = "available" | "not_available";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  userType: UserType;
  isApproved: boolean;
  emailVerified: boolean;
  profilePhoto?: string;
  status: UserStatus;
  publicKey: string;
  createdAt: string;
  friendsCount: number;
  requestsSentCount: number;
  requestsReceivedCount: number;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Message {
  id: string;
  senderUid: string;
  receiverUid: string;
  content: string; // Encrypted
  type: "text" | "voice" | "image" | "video" | "location";
  status: "sent" | "delivered" | "seen";
  createdAt: string;
}

export interface VaultItem {
  id: string;
  name: string;
  type: "photo" | "video" | "voice";
  encryptedBlob: Blob;
  createdAt: string;
}
