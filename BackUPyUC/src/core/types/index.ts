export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserInput extends UserCredentials {
  name: string;
  phone?: string;
  role?: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
} 