import { create } from "zustand";
import { profileApi, type ResellerProfile, type Verification } from "@/services/profile.api";

interface ResellerProfileState {
  profile: ResellerProfile | null;
  loading: boolean;
  loaded: boolean;
  /** Fetches the signed-in user's profile + verification status. */
  refresh: () => Promise<ResellerProfile | null>;
  setProfile: (profile: ResellerProfile) => void;
  reset: () => void;
}

/**
 * Current reseller profile, loaded once by the reseller layout. Not persisted:
 * verification must always reflect the server.
 */
export const useResellerProfileStore = create<ResellerProfileState>()((set) => ({
  profile: null,
  loading: false,
  loaded: false,
  refresh: async () => {
    set({ loading: true });
    try {
      const profile = await profileApi.getMe();
      set({ profile, loaded: true });
      return profile;
    } finally {
      set({ loading: false });
    }
  },
  setProfile: (profile) => set({ profile, loaded: true }),
  reset: () => set({ profile: null, loaded: false, loading: false }),
}));

/** Shown wherever a pending (not yet approved) reseller is blocked. */
export const ACCOUNT_PENDING_MESSAGE =
  "আপনার উদ্যোক্তা অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অনুমোদনের পর কার্টে যোগ ও অর্ডার করতে পারবেন।";

/** True when the backend rejected a request because the reseller is not approved yet. */
export function isAccountPendingError(err: any): boolean {
  return err?.response?.status === 403 && err?.response?.data?.code === "ACCOUNT_PENDING";
}

/**
 * True for a RESELLER account an admin has not approved yet (status PENDING).
 * Such resellers may browse, but cannot add to cart, order or withdraw.
 */
export function usePendingReseller(): boolean {
  const profile = useResellerProfileStore((state) => state.profile);
  return (
    (profile?.role || "").toUpperCase() === "RESELLER" &&
    (profile?.status || "").toUpperCase() === "PENDING"
  );
}

/**
 * Whether the current user may place reseller orders. Staff previewing the
 * portal are never blocked; RESELLER accounts must be approved (not pending)
 * and have a verified profile.
 */
export function useCanOrder(): {
  canOrder: boolean;
  pending: boolean;
  verification: Verification | null;
  loaded: boolean;
} {
  const profile = useResellerProfileStore((state) => state.profile);
  const loaded = useResellerProfileStore((state) => state.loaded);
  const pending = usePendingReseller();
  const verification = profile?.verification ?? null;
  const isReseller = (profile?.role || "").toUpperCase() === "RESELLER";
  return {
    canOrder: !isReseller || (!pending && Boolean(verification?.isVerified)),
    pending,
    verification,
    loaded,
  };
}
