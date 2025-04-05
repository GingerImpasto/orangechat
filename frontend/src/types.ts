export interface UserType {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

export interface AuthContextType {
  token: string | null;
  user: UserType | null;
  loading: boolean;
  setUser: (user: UserType | null) => void;
  isAuthenticated: boolean;
  login: (token: string, newUser: UserType) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

export type MessageType = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt?: string; // Optional field for timestamp
  imageUrl?: string | null;
};

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface FriendRequestType {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string | null;

  // These fields would be populated via Supabase joins
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    email: string;
  };

  receiver?: {
    // Optional since you might not always need this
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}
