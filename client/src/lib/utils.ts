import { clsx, type ClassValue } from "clsx";
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

export const formatDate = (timestamp: string) => {
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
