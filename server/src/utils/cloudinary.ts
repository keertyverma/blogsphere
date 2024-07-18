import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiOptions,
} from "cloudinary";
import config from "config";
import "dotenv/config";
import BadRequestError from "./errors/bad-request";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadSecurely = async (data: string) => {
  // upload file to cloudinary by using data URI of file in base64 encoding
  // return secure url
  try {
    const options: UploadApiOptions = {
      signed: true,
      folder: config.get("appName"),
    };

    const result = await cloudinary.uploader.upload(data, options);
    return result.secure_url;
  } catch (error) {
    const err = error as UploadApiErrorResponse;
    if (err.http_code === 400) throw new BadRequestError("Invalid image file");
    throw err;
  }
};

export const getAllUploadedImages = async (count?: number) => {
  try {
    const { resources } = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: config.get("appName") + "/", // Ensure the folder name ends with a slash to target only that folder
      max_results: count || 100,
    });

    return resources;
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    throw error;
  }
};

export const deleteUploadedImages = async (publicIds: string[]) => {
  const results = await cloudinary.api.delete_resources(publicIds, {
    type: "upload",
    resource_type: "image",
  });

  return results;
};

export const getPublicIdFromUrl = (url: string): string | undefined => {
  if (!url.includes("res.cloudinary.com")) {
    return undefined;
  }

  const Id = url.split("/")?.pop()?.split(".").shift();
  return Id ? `${config.get("appName")}/${Id}` : undefined;
};
