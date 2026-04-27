export interface ChurchResponse {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface CreateChurchRequest {
  name: string;
}

export interface UpdateChurchRequest {
  name: string;
}
