export type EventStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';

export interface EventResponse {
  id: number;
  groupId: number;
  title: string;
  location: string | null;
  eventDate: string;
  status: EventStatus;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  location?: string;
  eventDate: string;
  status?: EventStatus;
}

export interface UpdateEventRequest {
  title: string;
  location?: string;
  eventDate: string;
  status?: EventStatus;
}
