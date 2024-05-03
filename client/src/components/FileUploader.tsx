import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { IoCloudUploadOutline } from "react-icons/io5";

import { Button } from "./ui/button";
import { convertFileToUrl } from "@/lib/utils";

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles[0]);
      // TODO: upload image in cloud storage
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [file]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-white rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-1">
            <img src={fileUrl} alt="image" className="file_uploader-img" />
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
            only JPEG and PNG files are allowed.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
