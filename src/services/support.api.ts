import api from "./axios";

export type SupportTicketReason =
  | "PAYMENT"
  | "ORDER"
  | "TECHNICAL"
  | "PRODUCT"
  | "OTHER";

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface TicketUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string | null;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  userId: string;
  reason: SupportTicketReason;
  message: string;
  status: SupportTicketStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: TicketUser;
}

export interface CreateSupportTicketDto {
  reason: SupportTicketReason;
  message: string;
}

export interface UpdateSupportTicketStatusDto {
  status: SupportTicketStatus;
  adminNotes?: string;
}

export interface SupportTicketQueryDto {
  search?: string;
  status?: SupportTicketStatus;
  reason?: SupportTicketReason;
  page?: number | string;
  limit?: number | string;
}

export interface PaginatedTicketsResponse {
  data: SupportTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTicketResponse {
  success: boolean;
  message: string;
  ticketId: string;
  ticket: SupportTicket;
}

export const supportApi = {
  // Reseller methods
  createTicket: async (dto: CreateSupportTicketDto): Promise<CreateTicketResponse> => {
    const res = await api.post("/support/tickets", dto);
    return res.data;
  },

  getMyTickets: async (query?: SupportTicketQueryDto): Promise<PaginatedTicketsResponse> => {
    const res = await api.get("/support/tickets/my", { params: query });
    return res.data;
  },

  getMyTicketById: async (id: string): Promise<SupportTicket> => {
    const res = await api.get(`/support/tickets/my/${id}`);
    return res.data;
  },

  // Admin methods
  getAllTicketsAdmin: async (query?: SupportTicketQueryDto): Promise<PaginatedTicketsResponse> => {
    const res = await api.get("/support/tickets/admin/all", { params: query });
    return res.data;
  },

  getTicketByIdAdmin: async (id: string): Promise<SupportTicket> => {
    const res = await api.get(`/support/tickets/admin/${id}`);
    return res.data;
  },

  updateTicketStatusAdmin: async (
    id: string,
    dto: UpdateSupportTicketStatusDto
  ): Promise<SupportTicket> => {
    const res = await api.patch(`/support/tickets/admin/${id}/status`, dto);
    return res.data;
  },
};

export default supportApi;
