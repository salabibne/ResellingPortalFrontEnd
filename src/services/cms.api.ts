import api from "./axios";

export type CommonStatus = "ACTIVE" | "DEACTIVATED" | "PENDING";

export interface CMSBaseItem {
  id: string;
  status: CommonStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialMediaItem extends CMSBaseItem {
  name: string;
  iconName: string;
}

export interface ContactInfoItem extends CMSBaseItem {
  phone: string;
  email: string;
  address: string;
  telegram?: string;
  whatsapp?: string;
  facebook?: string;
}

export interface HeroSectionItem extends CMSBaseItem {
  heroTitle: string;
  heroSubtitle: string;
  buttonText1: string;
  buttonLink1: string;
  buttonText2?: string;
  buttonLink2?: string;
  imageUrl: string;
}

export interface AboutSectionItem extends CMSBaseItem {
  title: string;
  description: string;
  youtubeLink: string;
  buttonText1: string;
  buttonLink1: string;
  buttonText2?: string;
  buttonLink2?: string;
}

export interface FeatureSectionItem extends CMSBaseItem {
  title: string;
  description: string;
  imageUrl?: string;
  cardTitle: string;
  cardIcon: string;
  cardDescription: string;
  cardButton?: string;
  cardLink?: string;
}

export interface FounderProfileItem extends CMSBaseItem {
  title: string;
  description: string;
  imageUrl: string;
}

export interface FounderBlogItem extends CMSBaseItem {
  title: string;
  imageUrl: string;
  description: string;
}

export interface FounderVideoItem extends CMSBaseItem {
  title: string;
  videoLink: string;
  description: string;
}

export type CMSModuleType =
  | "social-media"
  | "contact"
  | "hero"
  | "about"
  | "section"
  | "founder"
  | "founder-blog"
  | "founder-video";

export interface PublicCMSData {
  hero: HeroSectionItem | null;
  about: AboutSectionItem | null;
  features: FeatureSectionItem[];
  founderProfile: FounderProfileItem | null;
  founderBlogs: FounderBlogItem[];
  founderVideos: FounderVideoItem[];
  contactInfo: ContactInfoItem | null;
  socialMedia: SocialMediaItem[];
}

export const cmsApi = {
  // Generic CRUD endpoints
  getAll: async <T = any>(module: CMSModuleType): Promise<T[]> => {
    const res = await api.get(`/cms/${module}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  getById: async <T = any>(module: CMSModuleType, id: string): Promise<T> => {
    const res = await api.get(`/cms/${module}/${id}`);
    return res.data?.data || res.data;
  },

  // Module specific GET helpers (returns ACTIVE items for public website)
  getHeroBanners: async (): Promise<HeroSectionItem[]> => {
    const items = await cmsApi.getAll<HeroSectionItem>("hero");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getAboutSections: async (): Promise<AboutSectionItem[]> => {
    const items = await cmsApi.getAll<AboutSectionItem>("about");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getFeatureSections: async (): Promise<FeatureSectionItem[]> => {
    const items = await cmsApi.getAll<FeatureSectionItem>("section");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getFounderProfiles: async (): Promise<FounderProfileItem[]> => {
    const items = await cmsApi.getAll<FounderProfileItem>("founder");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getFounderBlogs: async (): Promise<FounderBlogItem[]> => {
    const items = await cmsApi.getAll<FounderBlogItem>("founder-blog");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getFounderVideos: async (): Promise<FounderVideoItem[]> => {
    const items = await cmsApi.getAll<FounderVideoItem>("founder-video");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getContactInfo: async (): Promise<ContactInfoItem[]> => {
    const items = await cmsApi.getAll<ContactInfoItem>("contact");
    return items.filter((i) => i.status === "ACTIVE");
  },

  getSocialMedia: async (): Promise<SocialMediaItem[]> => {
    const items = await cmsApi.getAll<SocialMediaItem>("social-media");
    return items.filter((i) => i.status === "ACTIVE");
  },

  // Fetch all 8 CMS modules concurrently on website launch
  fetchAllPublicCMS: async (): Promise<PublicCMSData> => {
    const [
      heroRes,
      aboutRes,
      featureRes,
      founderProfileRes,
      founderBlogRes,
      founderVideoRes,
      contactRes,
      socialRes,
    ] = await Promise.allSettled([
      cmsApi.getAll<HeroSectionItem>("hero"),
      cmsApi.getAll<AboutSectionItem>("about"),
      cmsApi.getAll<FeatureSectionItem>("section"),
      cmsApi.getAll<FounderProfileItem>("founder"),
      cmsApi.getAll<FounderBlogItem>("founder-blog"),
      cmsApi.getAll<FounderVideoItem>("founder-video"),
      cmsApi.getAll<ContactInfoItem>("contact"),
      cmsApi.getAll<SocialMediaItem>("social-media"),
    ]);

    const activeFilter = <T extends CMSBaseItem>(res: PromiseSettledResult<T[]>): T[] => {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        const active = res.value.filter((item) => item.status === "ACTIVE");
        return active.length > 0 ? active : res.value;
      }
      return [];
    };

    const heroes = activeFilter(heroRes);
    const abouts = activeFilter(aboutRes);
    const features = activeFilter(featureRes);
    const founderProfiles = activeFilter(founderProfileRes);
    const founderBlogs = activeFilter(founderBlogRes);
    const founderVideos = activeFilter(founderVideoRes);
    const contacts = activeFilter(contactRes);
    const socials = activeFilter(socialRes);

    return {
      hero: heroes[0] || null,
      about: abouts[0] || null,
      features,
      founderProfile: founderProfiles[0] || null,
      founderBlogs,
      founderVideos,
      contactInfo: contacts[0] || null,
      socialMedia: socials,
    };
  },

  create: async <T = any>(module: CMSModuleType, data: Partial<T>): Promise<T> => {
    const res = await api.post(`/cms/${module}`, data);
    return res.data?.data || res.data;
  },

  update: async <T = any>(
    module: CMSModuleType,
    id: string,
    data: Partial<T>
  ): Promise<T> => {
    const res = await api.patch(`/cms/${module}/${id}`, data);
    return res.data?.data || res.data;
  },

  delete: async (module: CMSModuleType, id: string): Promise<void> => {
    await api.delete(`/cms/${module}/${id}`);
  },

  toggleStatus: async <T = any>(
    module: CMSModuleType,
    id: string,
    status: CommonStatus
  ): Promise<T> => {
    const res = await api.patch(`/cms/${module}/${id}`, { status });
    return res.data?.data || res.data;
  },
};

export default cmsApi;
