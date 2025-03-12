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
