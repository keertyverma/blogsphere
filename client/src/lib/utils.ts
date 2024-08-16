import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
  // List of valid top-level domains (TLDs)
  const validTLDs = [
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "mil",
    "co",
    "io",
    "ai",
    "in",
  ]; // Add more as needed

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const tld = hostname.substring(hostname.lastIndexOf(".") + 1);
    return validTLDs.includes(tld);
  } catch (e) {
    return false;
  }
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
