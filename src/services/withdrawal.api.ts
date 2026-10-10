import api from "./axios";

export type PayoutMethod = "BKASH" | "NAGAD" | "ROCKET" | "BANK_TRANSFER" | "CASH";
export type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" | "CANCELLED";

export interface CreateWithdrawalDto {
  amount: number;
  payoutMethod: PayoutMethod;
  accountDetails: string;
  resellerNotes?: string;
}

export interface CompleteWithdrawalDto {
  transactionId?: string;
  proofImageUrl?: string;
  adminNotes?: string;
}

export interface RejectWithdrawalDto {
  adminNotes: string;
}

export interface WithdrawalQueryDto {
  status?: WithdrawalStatus;
  payoutMethod?: PayoutMethod;
  resellerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface ResellerWalletSummary {
  totalEarnedProfit: number;
  pendingProfit: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  rejectedWithdrawal: number;
  withdrawableBalance: number;
}

export interface WithdrawalItem {
  id: string;
  resellerId: string;
  amount: number | string;
  payoutMethod: PayoutMethod;
  accountDetails: string;
  status: WithdrawalStatus;
  resellerNotes?: string | null;
  transactionId?: string | null;
  proofImageUrl?: string | null;
  adminNotes?: string | null;
  processedBy?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reseller?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    pageName?: string | null;
    imageUrl?: string | null;
  };
  processedByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ResellerWithdrawalResponse {
  data: WithdrawalItem[];
  summary: ResellerWalletSummary;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminWithdrawalResponse {
  data: WithdrawalItem[];
  kpis: {
    totalPaidOut: number;
    totalPendingAmount: number;
    pendingCount: number;
    completedCount: number;
    rejectedCount: number;
    totalRequests: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const withdrawalApi = {
  // Reseller Endpoints
  createRequest: async (dto: CreateWithdrawalDto): Promise<WithdrawalItem> => {
    const res = await api.post("/withdrawals/request", dto);
    return res.data;
  },

  getMyWithdrawals: async (query?: WithdrawalQueryDto): Promise<ResellerWithdrawalResponse> => {
    const res = await api.get("/withdrawals/my-withdrawals", { params: query });
    return res.data;
  },

  getWalletSummary: async (): Promise<ResellerWalletSummary> => {
    const res = await api.get("/withdrawals/wallet-summary");
    return res.data;
  },

  cancelWithdrawal: async (id: string): Promise<WithdrawalItem> => {
    const res = await api.patch(`/withdrawals/${id}/cancel`);
    return res.data;
  },

  // Admin Endpoints
  getAllAdmin: async (query?: WithdrawalQueryDto): Promise<AdminWithdrawalResponse> => {
    const res = await api.get("/withdrawals/admin/all", { params: query });
    return res.data;
  },

  completeWithdrawalAdmin: async (
    id: string,
    dto: CompleteWithdrawalDto,
  ): Promise<WithdrawalItem> => {
    const res = await api.patch(`/withdrawals/admin/${id}/complete`, dto);
    return res.data;
  },

  rejectWithdrawalAdmin: async (
    id: string,
    dto: RejectWithdrawalDto,
  ): Promise<WithdrawalItem> => {
    const res = await api.patch(`/withdrawals/admin/${id}/reject`, dto);
    return res.data;
  },
};
