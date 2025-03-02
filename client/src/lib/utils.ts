import { OutputBlockData } from "@editorjs/editorjs";
import confetti from "canvas-confetti";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import DOMPurify from "dompurify";
import { toast, ToastContainerProps, ToastOptions } from "react-toastify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const fileToBase64 = (file: File): Promise<string> => {
  // convert file object to base64 encoded string
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

export const formatDate = (timestamp?: string) => {
  if (!timestamp) return null;
  // returns data in format -> Month Day, Year  [example -> May 14, 2024]
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date = new Date(timestamp);

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const getTimeAgo = (timestamp: string) => {
  if (!timestamp) return null;

  dayjs.extend(relativeTime);
  const timeAgo = dayjs(timestamp).fromNow();
  return timeAgo;
};

export const formateNumber = (num: number): string => {
  if (num >= 1000 && num < 1000000) {
    // For numbers between 1,000 and 999,999
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  } else if (num >= 1000000 && num < 1000000000) {
    // For numbers between 1,000,000 and 999,999,999
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000000000) {
    // For numbers 1,000,000,000 and above
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  } else {
    // For numbers less than 1,000
    return num.toString();
  }
};

export const checkIsLiked = (
  likes: { [key: string]: boolean },
  userId: string
) => {
  return userId in likes;
};

export const isValidUrl = (url: string) => {
  // parse the url and extract the hostname
  try {
    const parsedUrl = new URL(url);
    return !!parsedUrl.hostname;
  } catch (e) {
    return false;
  }
};

export const isValidSocialPlatformUrl = (url: string, platform: string) => {
  const patterns: Record<string, RegExp> = {
    instagram: /^(https?:\/\/)(www\.)?instagram\.com\/.+$/, // Accepts anything after "instagram.com/"
    facebook: /^(https?:\/\/)(www\.)?facebook\.com\/.+$/, // Accepts anything after "facebook.com/"
    twitter: /^(https?:\/\/)(www\.)?(x\.com|twitter\.com)\/.+$/, // Accepts anything after "x.com/" or "twitter.com/"
    github: /^(https?:\/\/)(www\.)?github\.com\/.+$/, // Accepts anything after "github.com/"
    youtube: /^(https?:\/\/)(www\.)?youtube\.com\/.+$/, // Accepts anything after "youtube.com/"
    website: /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}.*$/, // Generic website pattern
  };

  if (!isValidUrl(url)) return false;

  const platformPattern = patterns[platform];
  return platformPattern ? platformPattern.test(url) : false;
};

export const handleProfileImgErr = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  // set fallback user profile image
  const target = e.target as HTMLImageElement;
  target.src = "/assets/images/default_profile.png";
};

export const truncateText = (text: string, maxLength: number) => {
  // truncate text while handling multi-byte characters like emojis
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength); // Slice the string to the countLimit

  /*------ Handle multi-byte characters -----
   - A surrogate pair is a way of encoding characters that requires more than 16 bits, like emojis.
   - A surrogate pair consists of two 16-bit code units -> 
      - High Surrogate: Falls in the range 0xD800 to 0xDBFF.
      - Low Surrogate: Falls in the range 0xDC00 to 0xDFFF
   - If the last character is a high surrogate then remove it.
   */
  return truncated.length < text.length &&
    truncated.charCodeAt(truncated.length - 1) >= 0xd800 &&
    truncated.charCodeAt(truncated.length - 1) <= 0xdbff
    ? truncated.slice(0, -1)
    : truncated;
};

export const capitalize = (text: string): string => {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Validates the content of a block to ensure it is not empty or invalid.
 * This function checks the content of various block types (e.g., paragraph, header, list, image, quote, code)
 * to ensure they contain meaningful content. If a block is empty or contains only whitespace or a <br> tag,
 * it will be considered invalid. At least one non-empty block is required for valid content.
 */
export const isValidBlockContent = (block: OutputBlockData): boolean => {
  const { type, data } = block;

  // Paragraph and Quote Blocks: Check if text is not just <br>
  if (type === "paragraph" || type === "quote")
    return data.text && data.text.trim() !== "<br>";

  // Header Blocks: Ensure that the header text is not empty
  if (type === "header") return data.text.trim() !== "";

  // Image Blocks: Check for a valid url
  if (type === "image") return Boolean(data.file?.url);

  // List Blocks: Ensure there are items in the list
  if (type === "list") return data.items && data.items.length > 0;

  // Code Blocks: Check if the code block has non-empty code content
  if (type === "code") return data.code && data.code.trim() !== "";

  // For other block types, return true (content is considered valid)
  return true;
};

export const getToastOptions = (): ToastContainerProps => ({
  position: "bottom-right",
  style: {
    width: "auto", // Keeps width dynamic
    minWidth: "100px", // Ensures small toasts don’t get too tiny
    maxWidth: "400px", // Prevents full-width expansion
  },
  autoClose: 5000,
  hideProgressBar: true,
  pauseOnHover: false,
});

// Success Toast Notification
export const showSuccessToast = (
  message: React.ReactNode,
  options?: ToastOptions<unknown>
) => {
  toast.success(message, {
    autoClose: 3000,
    closeButton: false,
    ...options,
  });
};

// Error Toast Notification
export const showErrorToast = (
  message: React.ReactNode,
  options?: ToastOptions<unknown>
) => {
  toast.error(message, { ...options });
};

// Prefix used for localStorage keys related to blog read timestamps.
const READKEYPREFIX = "lastReadTimestamp_";

export const setLastReadTimestamp = (blogId: string, value: string) => {
  // Stores the last read timestamp for a specific blog.
  localStorage.setItem(`${READKEYPREFIX}${blogId}`, value);
};

export const getLastReadTimestamp = (blogId: string): string | null => {
  // Retrieves the last read timestamp for a specific blog.
  return localStorage.getItem(`${READKEYPREFIX}${blogId}`);
};

export const clearBlogReadTimestamps = () => {
  // Clears all blog read tracking timestamps from localStorage.
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(READKEYPREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export const showConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};

/**
 * Sanitizes user-generated HTML content to remove potential security threats like XSS attacks.
 *
 * This function uses DOMPurify to clean the input HTML string, ensuring that only
 * safe HTML elements and attributes are retained. It is particularly useful
 * for rendering user-generated content in a secure manner.
 *
 * @param {string} htmlContent - The HTML content to be sanitized.
 * @returns {string} - A sanitized HTML string with unsafe elements removed.
 */
export const sanitizeContent = (htmlContent: string): string => {
  return DOMPurify.sanitize(htmlContent);
};
