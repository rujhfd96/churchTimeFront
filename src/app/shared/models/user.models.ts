export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  groupId: number | null;
  groupName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  groupId?: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  groupId?: number;
  password?: string;
}

export interface AssignUserGroupRequest {
  groupId: number;
}
