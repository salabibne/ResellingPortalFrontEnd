import api from "./axios";
import { IMAGE_SIZES, ImageSizeKey, ImageSizeSpec, checkImageFit } from "@/utils/imageSizes";

export interface UploadedMedia {
  id: string;
  url: string;
  filename: string;
}

export interface PreparedUpload {
  media: UploadedMedia;
  /** Set when the picked image doesn't match the recommended size/shape. */
  warning: string | null;
}

export const MAX_UPLOAD_MB = 5;
export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");

/**
 * The API returns uploads as "/uploads/<file>". Store the full public URL so
 * every <img> on the site (storefront, invoice, popups...) can use it as-is,
 * whether the API runs on its own domain or under /backend on cPanel.
 */
export function toPublicMediaUrl(url: string): string {
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return url;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read this image file."));
    };
    img.src = objectUrl;
  });
}

/**
 * Downscales large photos (e.g. 4000px phone pictures) to at most 1.5× the
 * recommended size and re-encodes them as WebP. Transparency is kept.
 * GIFs (may be animated) and already-small files are uploaded untouched.
 */
async function shrinkImage(file: File, img: HTMLImageElement, spec: ImageSizeSpec): Promise<File> {
  if (file.type === "image/gif") return file;

  const maxW = Math.round(spec.width * 1.5);
  const maxH = Math.round(spec.height * 1.5);
  const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
  if (scale === 1 && file.size <= 600 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

export const mediaApi = {
  /** Raw upload. Returns the stored media with a full public URL. */
  upload: async (file: File): Promise<UploadedMedia> => {
    const form = new FormData();
    form.append("file", file);
    // The shared client defaults to JSON, which makes axios serialise FormData
    // into '{"file":{}}' (the image is lost). Marking it multipart keeps the
    // FormData; the browser then sets the real boundary header itself.
    const res = await api.post("/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ...res.data, url: toPublicMediaUrl(res.data.url) };
  },

  /**
   * Validates, size-checks and (if needed) shrinks an image for the given
   * placement, then uploads it.
   */
  uploadImage: async (file: File, sizeKey?: ImageSizeKey): Promise<PreparedUpload> => {
    if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) {
      throw new Error("Only JPG, PNG, WebP or GIF images can be uploaded.");
    }

    let toSend = file;
    let warning: string | null = null;
    try {
      const img = await loadImage(file);
      if (sizeKey) {
        warning = checkImageFit(sizeKey, img.naturalWidth, img.naturalHeight);
        toSend = await shrinkImage(file, img, IMAGE_SIZES[sizeKey]);
      }
    } catch {
      // If the browser can't decode it, let the server decide.
    }

    if (toSend.size > MAX_UPLOAD_MB * 1024 * 1024) {
      throw new Error(`Image is larger than ${MAX_UPLOAD_MB} MB. Please choose a smaller file.`);
    }

    const media = await mediaApi.upload(toSend);
    return { media, warning };
  },

  list: async (limit = 50): Promise<UploadedMedia[]> => {
    const res = await api.get("/media", { params: { limit } });
    return (res.data as UploadedMedia[]).map((m) => ({ ...m, url: toPublicMediaUrl(m.url) }));
  },
};

export function uploadErrorMessage(err: any): string {
  const message = err?.response?.data?.message ?? err?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (err?.response?.status === 413) return `Image is larger than ${MAX_UPLOAD_MB} MB.`;
  if (err?.response?.status === 403) return "You don't have permission to upload images.";
  return message || "Upload failed. Try again.";
}

export default mediaApi;
