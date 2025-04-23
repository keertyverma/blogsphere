import * as z from "zod";
import { isReservedUsername, isValidSocialPlatformUrl } from "../utils";

export const SignupValidation = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, { message: "Full name is required." })
    .min(2, { message: "Full name must be at least 2 characters." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/, {
      message:
        "Password should be 8 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters.",
    }),
});

export const LoginValidation = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email("Enter a valid email address."),
  password: z.string().min(1, { message: "Password is required." }),
});

export const BlogValidation = z.object({
  title: z.string().min(10, {
    message: "Title is too short. It must be at least 10 characters.",
  }),
  description: z
    .string()
    .min(20, {
      message: "Blog summary must be atleast 20 characters long.",
    })
    .max(200, { message: "Blog summary must be within 200 characters." }),
  tag: z.string(),
});

export const ChangePasswordValidation = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(1, { message: "Current Password is required." })
    .min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z
    .string()
    .trim()
    .min(1, { message: "New Password is required." })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/, {
      message:
        "New Password should be 8 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters.",
    }),
});

export const EditProfileValidation = z.object({
  fullname: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name should not be more than 50 characters." })
    .optional(),
  bio: z
    .string()
    .trim()
    .max(200, { message: "Bio should not be more than 200 characters." })
    .optional(),
  profileImageFile: z.array(z.any()),
  youtube: z
    .string()
    .trim()
    .refine((url) => isValidSocialPlatformUrl(url, "youtube"), {
      message: "Please enter a valid YouTube profile URL",
    })
    .or(z.literal(""))
    .optional(),
  instagram: z
    .string()
    .trim()
    .refine((url) => isValidSocialPlatformUrl(url, "instagram"), {
      message: "Please enter a valid Instagram profile URL",
    })
    .or(z.literal(""))
    .optional(),
  facebook: z
    .string()
    .trim()
    .refine((url) => isValidSocialPlatformUrl(url, "facebook"), {
      message: "Please enter a valid Facebook profile URL",
    })
    .or(z.literal(""))
    .optional(),
  twitter: z
    .string()
    .trim()
    .refine((url) => isValidSocialPlatformUrl(url, "twitter"), {
      message: "Please enter a valid X/Twitter profile URL",
    })
    .or(z.literal(""))
    .optional(),
  github: z
    .string()
    .trim()
    .refine((url) => isValidSocialPlatformUrl(url, "github"), {
      message: "Please enter a valid GitHub profile URL",
    })
    .or(z.literal(""))
    .optional(),
  website: z
    .string()
    .trim()
    .refine((url) => isValidSocialPlatformUrl(url, "website"), {
      message: "Please enter a valid Website URL",
    })
    .or(z.literal(""))
    .optional(),
});

export const ResetPasswordValidation = z.object({
  newPassword: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/, {
    message:
      "Password should be 8 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters.",
  }),
  confirmNewPassword: z.string(),
});

export const ChangeUsernameValidation = z.object({
  newUsername: z
    .string()
    .trim()
    .min(1, { message: "Username is required." })
    .max(30, { message: "Username must be at most 30 characters long." })
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Username can include letters, numbers, hyphens (-), and underscores (_). It must be between 1 to 30 characters long.",
    })
    .refine((username) => !isReservedUsername(username), {
      message: "This username is reserved. Please choose another one.",
    }),
});
