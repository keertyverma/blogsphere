import { useUpload } from "@/lib/react-query/queries";
import {
  convertFileToUrl,
  fileToBase64,
  handleProfileImgErr,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { IoCloudUploadOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

interface Props {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  onUpload: (url: string) => void;
}

const ProfileUploader = ({ fieldChange, mediaUrl, onUpload }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string>(mediaUrl);
  const { mutateAsync: upload, isPending: isUploading } = useUpload();

  const uploadImage = useCallback(
    async (base64EncodedImg: string) => {
      try {
        const result = await upload(base64EncodedImg);
        const url = result.url;
        onUpload(url);
      } catch (error) {
        setPreviewUrl(mediaUrl);
        if (!useAuthStore.getState().isTokenExpired) {
          toast.error("An error occurred. Please try again later.");
        }
      }
    },
    [onUpload, setPreviewUrl, upload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        fieldChange(acceptedFiles);
        setPreviewUrl(convertFileToUrl(selectedFile));

        // get base64 image string
        const base64EncodedImg = await fileToBase64(selectedFile);
        // upload image
        await uploadImage(base64EncodedImg);
      }
    },
    [fieldChange, setPreviewUrl, uploadImage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
    multiple: false,
  });

  return (
    <div className="flex gap-2 !mt-4">
      <div className="w-36 h-36 flex items-center relative">
        {isUploading && (
          <div className="w-full h-full absolute top-0 left-0 flex-center bg-black/60 opacity-100 cursor-pointer rounded-full">
            <LoadingSpinner className="mt-2 h-6 md:w-6 text-white" />
          </div>
        )}
        <img
          src={previewUrl}
          alt="profile image"
          className="w-full h-full object-cover rounded-full border-2 border-muted-foreground/40"
          onError={handleProfileImgErr}
        />
      </div>

      <div className="place-self-center">
        <div className="border rounded-md p-3 ml-4">
          <div {...getRootProps()} className="cursor-pointer">
            <input
              {...getInputProps()}
              className="cursor-pointer"
              disabled={isUploading}
            />
            <Button
              variant="secondary"
              className="flex-center gap-2 rounded-full h-9 cursor-pointer border"
              type="button"
            >
              <IoCloudUploadOutline className="text-xl md:text-2xl" />
              Change Image
            </Button>
          </div>
          <p className="text-[12px] font-normal leading-[140%] text-slate-500 dark:text-slate-400 text-center mt-1">
            Supports JPEG and PNG files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileUploader;
