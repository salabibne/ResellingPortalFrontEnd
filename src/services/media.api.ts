import api from "./axios";

export interface UploadedMedia {
  id: string;
  url: string;
  filename: string;
}

export const mediaApi = {
  upload: async (file: File): Promise<UploadedMedia> => {
    const form = new FormData();
    form.append("file", file);
    // Let the browser set the multipart boundary automatically.
    const res = await api.post("/media/upload", form);
    return res.data;
  },

  list: async (limit = 50): Promise<UploadedMedia[]> => {
    const res = await api.get("/media", { params: { limit } });
    return res.data;
  },
};

export default mediaApi;
