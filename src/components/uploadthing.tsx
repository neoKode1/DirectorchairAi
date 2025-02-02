"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import type { ClientUploadedFileData } from "uploadthing/types";

type UploadResult = {
  url: string;
};

interface UploadthingProps {
  onClientUploadComplete?: (res: UploadResult[]) => void;
  onUploadError?: (error: Error) => void;
}

export function FileUploader({
  onClientUploadComplete,
  onUploadError,
}: UploadthingProps) {
  return (
    <div className="w-full">
      <UploadDropzone
        endpoint="fileUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          const results = res.map((file) => ({
            url: file.url,
          }));
          onClientUploadComplete?.(results);
        }}
        onUploadError={(error: Error) => {
          console.error("Error: ", error);
          onUploadError?.(error);
        }}
        config={{
          mode: "auto",
        }}
        appearance={{
          container: "w-full",
          allowedContent: "text-sm text-gray-400",
          button: "ut-uploading:cursor-not-allowed ut-uploading:bg-gray-200",
        }}
      />
    </div>
  );
}
