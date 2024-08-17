import { useUpload } from "@/lib/react-query/queries";
import {
  convertFileToUrl,
  fileToBase64,
  handleProfileImgErr,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import LoadingSpinner from "../ui/LoadingSpinner";

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
  });

  return (
    <div {...getRootProps()}>
      <input
        {...getInputProps()}
        className="cursor-pointer"
        disabled={isUploading}
      />

      {isUploading && (
        <div className="flex-center my-1">
          <LoadingSpinner className=" ml-2 h-5 w-5 md:h-6 md:w-6" />
        </div>
      )}

      <div className="w-36 h-36 cursor-pointer flex items-center gap-4 relative">
        <div className="w-full h-full absolute top-0 left-0 flex-center text-white bg-black/60 opacity-0 hover:opacity-100 cursor-pointer rounded-full">
          Upload Image
        </div>
        <img
          src={previewUrl}
          alt="profile image"
          className="w-full h-full object-cover rounded-full border-2 border-muted-foreground/40"
          onError={handleProfileImgErr}
        />
      </div>
    </div>
  );
};

export default ProfileUploader;
