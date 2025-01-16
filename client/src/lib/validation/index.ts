import * as z from "zod";
import { isValidSocialPlatformUrl } from "../utils";

export const SignupValidation = z.object({
  fullname: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/, {
    message:
      "Password should be 8 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters.",
  }),
});

export const LoginValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const BlogValidation = z.object({
  title: z
    .string()
    .min(10, { message: "Title must be at least 10 characters." }),
  description: z
    .string()
    .min(20, { message: "Short description must be atleast 20 characters." })
    .max(200, { message: "Short description must be within 200 characters." }),
  tag: z.string(),
});

export const ChangePasswordValidation = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z
    .string()
    .trim()
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
