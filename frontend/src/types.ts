export interface UserType {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Add a loading state
  login: () => void;
  logout: () => void;
}

export type MessageType = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt?: string; // Optional field for timestamp
};
