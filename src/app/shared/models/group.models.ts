export interface GroupResponse {
  id: number;
  churchId: number;
  leaderId: number | null;
  leaderName: string | null;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name: string;
  description?: string;
}

export interface AssignLeaderRequest {
  leaderUserId: number | null;
}
