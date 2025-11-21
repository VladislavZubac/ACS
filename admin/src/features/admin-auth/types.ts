export type UserRole = "USER" | "ADMIN";

export type AdminUser = {
  id: string;
  username: string;
  role: UserRole;
  assignedSpaceBytes: number;
  usedSpaceBytes: number;
};

export type AuthResponse = {
  token: string;
  user: AdminUser;
};

export type LoginPayload = {
  username: string;
  password: string;
};


