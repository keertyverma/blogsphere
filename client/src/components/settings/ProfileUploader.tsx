import { convertFileToUrl } from "@/lib/utils";
import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

interface Props {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
}

const ProfileUploader = ({ fieldChange, mediaUrl }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        fieldChange(acceptedFiles);
        setFileUrl(convertFileToUrl(selectedFile));

        // TODO: upload image
      }
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
    <div {...getRootProps()}>
      <input {...getInputProps()} className="cursor-pointer" />

      <div className="cursor-pointer flex items-center gap-4">
        {fileUrl && (
          <img
            src={fileUrl}
            alt="profile image"
            className="w-36 h-36 object-cover rounded-full border-2 border-border"
          />
        )}
      </div>
    </div>
  );
};

export default ProfileUploader;
