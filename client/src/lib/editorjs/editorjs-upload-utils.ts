import { useAuthStore } from "@/store";
import apiClient from "../api-client";
import { fileToBase64, showErrorToast } from "../utils";

export const uploadImageByURL = async (url: string) => {
  /*
   * Uploads a public image URL to the EditorJS Image Block.
   *
   * ### Expected Input:
   * - A **valid** image-like URL (must end with a standard image extension).
   * - Example of **valid URLs**:
   *   - "https://example.com/image.jpg"
   *   - "https://cdn.site.com/pic.png"
   *   - "https://images.com/photo.webp"
   *
   * ### Invalid Cases:
   * - URLs that do not end with a proper image extension.
   * - Example of **invalid URLs**:
   *   - "https://img.site.com/pic?crop=250x350" (query params without extension)
   *   - "https://example.com/image" (no extension)
   */
  return url ? { success: 1, file: { url } } : { success: 0 };
};

export const uploadImage = async (img: File) => {
  let imgURL = null;

  // get base64 image string
  const base64EncodedImg = await fileToBase64(img);
  try {
    const result = await apiClient
      .post("/upload", { data: base64EncodedImg })
      .then((res) => res.data.result);
    imgURL = result.url;
  } catch (error) {
    if (!useAuthStore.getState().isTokenExpired) {
      showErrorToast("Failed to upload cover image. Please try again later.");
    }
  }

  return imgURL;
};

export const uploadImageByFile = async (e: File) => {
  /*
   * Handles file uploads for EditorJS image blocks.
   * - Calls `uploadImage` to upload the selected file.
   * - Returns the expected response format for EditorJS image blocks.
   */
  const url = await uploadImage(e);
  return url ? { success: 1, file: { url } } : { success: 0 };
};
