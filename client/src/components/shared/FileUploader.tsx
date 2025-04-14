import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { IoCloudUploadOutline } from "react-icons/io5";

import { useUpload } from "@/lib/react-query/queries";
import {
  convertFileToUrl,
  fileToBase64,
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

interface Props {
  onUpload: (url: string) => void;
}

const FileUploader = ({ onUpload }: Props) => {
  const [previewURL, setPreviewURL] = useState("");

  const { mutateAsync: upload, isPending: isUploading } = useUpload();

  const uploadImage = useCallback(
    async (base64EncodedImg: string) => {
      try {
        const result = await upload(base64EncodedImg);
        const url = result.url;
        onUpload(url);
        showSuccessToast("Successfully uploaded!");
      } catch (error) {
        setPreviewURL("");
        if (!useAuthStore.getState().isTokenExpired) {
          showErrorToast(
            "Failed to upload cover image. Please try again later."
          );
        }
      }
    },
    [onUpload, setPreviewURL, upload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setPreviewURL(convertFileToUrl(selectedFile));

        // get base64 image string
        const base64EncodedImg = await fileToBase64(selectedFile);
        // upload image
        await uploadImage(base64EncodedImg);
      }
    },
    [setPreviewURL, uploadImage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center bg-header flex-col cursor-pointer"
    >
      <input
        {...getInputProps()}
        className="cursor-pointer"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="flex-center my-1">
          <p className="text-base text-muted-foreground">uploading ...</p>
          <LoadingSpinner className=" ml-2 h-5 w-5 md:h-6 md:w-6" />
        </div>
      )}
      {previewURL ? (
        <>
          <div className="flex flex-1 justify-center w-full p-1">
            <img src={previewURL} alt="cover image" className="cover-img" />
          </div>
          <p className="file_uploader-label">Click photo to replace</p>
        </>
      ) : (
        <div className="file_uploader-box">
          <div className="max-sm:hidden text-center">
            <p className="base-regular text-secondary-foreground ">
              Drag and drop image here
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">OR</p>
          </div>
          <Button
            variant="outline"
            className="flex-center gap-2 rounded-full h-7 text-secondary-foreground"
          >
            <IoCloudUploadOutline className="text-xl md:text-2xl" />
            Upload Image
          </Button>
          <p className="small-regular mb-6 text-muted-foreground text-center">
            Supports JPEG and PNG files.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
