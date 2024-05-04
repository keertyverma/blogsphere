import "dotenv/config";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadSecurely = async (fileData: any) => {
  const options: UploadApiOptions = {
    signed: true,
  };

  const result = await cloudinary.uploader.upload(fileData, options);
  console.log(result);

  return result.secure_url;
};
