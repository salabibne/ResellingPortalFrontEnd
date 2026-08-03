import { create } from "zustand";
import cmsApi, {
  HeroSectionItem,
  AboutSectionItem,
  FeatureSectionItem,
  FounderProfileItem,
  FounderBlogItem,
  FounderVideoItem,
  ContactInfoItem,
  SocialMediaItem,
} from "@/services/cms.api";

interface CMSState {
  hero: HeroSectionItem | null;
  about: AboutSectionItem | null;
  features: FeatureSectionItem[];
  founderProfile: FounderProfileItem | null;
  founderBlogs: FounderBlogItem[];
  founderVideos: FounderVideoItem[];
  contactInfo: ContactInfoItem | null;
  socialMedia: SocialMediaItem[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  fetchPublicCMS: (force?: boolean) => Promise<void>;
}

export const useCMSStore = create<CMSState>((set, get) => ({
  hero: null,
  about: null,
  features: [],
  founderProfile: null,
  founderBlogs: [],
  founderVideos: [],
  contactInfo: null,
  socialMedia: [],
  loading: false,
  initialized: false,
  error: null,

  fetchPublicCMS: async (force = false) => {
    // Avoid refetching if already initialized unless forced
    if (get().loading || (get().initialized && !force)) return;

    set({ loading: true, error: null });

    try {
      const cmsData = await cmsApi.fetchAllPublicCMS();
      set({
        hero: cmsData.hero,
        about: cmsData.about,
        features: cmsData.features,
        founderProfile: cmsData.founderProfile,
        founderBlogs: cmsData.founderBlogs,
        founderVideos: cmsData.founderVideos,
        contactInfo: cmsData.contactInfo,
        socialMedia: cmsData.socialMedia,
        loading: false,
        initialized: true,
      });
    } catch (err: any) {
      console.error("Failed to load public CMS data on launch:", err);
      set({
        error: err?.message || "Failed to load site CMS content",
        loading: false,
        initialized: true,
      });
    }
  },
}));
