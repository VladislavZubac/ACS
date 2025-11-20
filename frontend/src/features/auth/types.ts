export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
  assignedSpaceBytes: number;
  usedSpaceBytes: number;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  password: string;
};

