/**
 * Recommended image sizes for every place an admin can upload an image.
 * Shown under each upload field, and used to downscale oversized uploads in
 * the browser before they are sent (keeps hosting disk + bandwidth small).
 */
export interface ImageSizeSpec {
  width: number;
  height: number;
  /** Short note shown under the recommended size. */
  note?: string;
}

export const IMAGE_SIZES = {
  logo: { width: 600, height: 160, note: "Transparent PNG, wide logo" },
  heroBanner: { width: 1600, height: 900, note: "Keep text/faces in the centre — mobile crops the sides" },
  mobileBanner: { width: 1200, height: 900, note: "Shown instead of the main image on phones" },
  wideBanner:{ width: 1600, height: 600, note: "Wide promo banner" },
  storyImage: { width: 1600, height: 900 },
  cardImage: { width: 1200, height: 900 },
  coverImage: { width: 1280, height: 720 },
  blogImage: { width: 1200, height: 675 },
  noticeImage: { width: 1200, height: 500, note: "Public pop-up crops to a wide strip; Uddokta pop-up shows the whole image" },
  productImage: { width: 1000, height: 1250, note: "Portrait 4:5, plain background" },
  productLandingBanner: { width: 1600, height: 900 },
  square: { width: 600, height: 600 },
  profilePhoto: { width: 600, height: 600, note: "Square photo, face in the centre" },
  paymentProof: { width: 1200, height: 1600, note: "Screenshot or receipt photo" },
} satisfies Record<string, ImageSizeSpec>;

export type ImageSizeKey = keyof typeof IMAGE_SIZES;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function aspectLabel(spec: ImageSizeSpec): string {
  const d = gcd(spec.width, spec.height);
  return `${spec.width / d}:${spec.height / d}`;
}

export function describeImageSize(key: ImageSizeKey): string {
  const spec: ImageSizeSpec = IMAGE_SIZES[key];
  return `Recommended ${spec.width} × ${spec.height} px (${aspectLabel(spec)})${spec.note ? ` · ${spec.note}` : ""}`;
}

/** Returns a warning when an uploaded image's shape/size clearly doesn't match the recommendation. */
export function checkImageFit(key: ImageSizeKey, width: number, height: number): string | null {
  const spec: ImageSizeSpec = IMAGE_SIZES[key];
  const wanted = spec.width / spec.height;
  const actual = width / height;
  if (Math.abs(actual - wanted) / wanted > 0.12) {
    return `Your image is ${width} × ${height} px (${actual.toFixed(2)}:1) but this spot is ${aspectLabel(spec)} — parts may be cropped.`;
  }
  if (width < spec.width * 0.6) {
    return `Your image is only ${width} × ${height} px — it may look blurry. Use at least ${spec.width} × ${spec.height} px.`;
  }
  return null;
}
