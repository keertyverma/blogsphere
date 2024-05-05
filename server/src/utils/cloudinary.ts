import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiErrorResponse,
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
