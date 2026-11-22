import api from "./axios";

export interface VerificationField {
  key: string;
  label: string;
}

export interface Verification {
  isVerified: boolean;
  completed: number;
  total: number;
  missing: VerificationField[];
}

export interface ResellerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  secondaryPhone: string | null;
  role: string;
  status: "ACTIVE" | "PENDING" | "DEACTIVATED";
  imageUrl: string | null;
  pageName: string | null;
  nidNumber: string | null;
  presentAddress: string | null;
  presentDistrict: string;
  presentThana: string;
  permanentDistrict: string;
  permanentThana: string;
  createdAt: string;
  verification: Verification;
}

export type UpdateProfilePayload = Partial<
  Pick<
    ResellerProfile,
    | "name"
    | "secondaryPhone"
    | "pageName"
    | "nidNumber"
    | "imageUrl"
    | "presentAddress"
    | "presentDistrict"
    | "presentThana"
    | "permanentDistrict"
    | "permanentThana"
  >
>;

export const profileApi = {
  getMe: async (): Promise<ResellerProfile> => {
    const res = await api.get("/profile/me");
    return res.data;
  },

  updateMe: async (payload: UpdateProfilePayload): Promise<ResellerProfile> => {
    const res = await api.patch("/profile/me", payload);
    return res.data;
  },
};

/** True when an API error is the backend's "complete your profile first" gate. */
export function isProfileNotVerifiedError(err: unknown): boolean {
  const data = (err as { response?: { data?: { code?: string } } })?.response?.data;
  return data?.code === "PROFILE_NOT_VERIFIED";
}

export default profileApi;
