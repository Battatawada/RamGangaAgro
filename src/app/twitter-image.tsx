import { shareAlt, shareContentType, shareImage, shareSize } from "@/components/share-image";

export const alt = shareAlt;
export const size = shareSize;
export const contentType = shareContentType;

export default function TwitterImage() {
  return shareImage();
}
