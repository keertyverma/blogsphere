import { useUpload } from "@/lib/react-query/queries";
import { convertFileToUrl, fileToBase64 } from "@/lib/utils";
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
        const res = await upload(base64EncodedImg);
        const url = res.data.url;
        onUpload(url);
        toast.success("Profile Image Uploaded👍", {
          position: "top-right",
          className: "mt-20",
          autoClose: 2000,
        });
      } catch (error) {
        setPreviewUrl(mediaUrl);
        toast.error("An error occurred. Please try again later.", {
          position: "top-right",
          className: "mt-20",
        });
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

      {previewUrl && (
        <div className="cursor-pointer flex items-center gap-4">
          <img
            src={previewUrl}
            alt="profile image"
            className="w-36 h-36 object-cover rounded-full border-2 border-border"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileUploader;
