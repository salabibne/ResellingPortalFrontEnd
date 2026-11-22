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

/**
 * Whether the current user may place reseller orders. Staff previewing the
 * portal are never blocked; only RESELLER accounts need a verified profile.
 */
export function useCanOrder(): { canOrder: boolean; verification: Verification | null; loaded: boolean } {
  const profile = useResellerProfileStore((state) => state.profile);
  const loaded = useResellerProfileStore((state) => state.loaded);
  const verification = profile?.verification ?? null;
  const isReseller = (profile?.role || "").toUpperCase() === "RESELLER";
  return {
    canOrder: !isReseller || Boolean(verification?.isVerified),
    verification,
    loaded,
  };
}
