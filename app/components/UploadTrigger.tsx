'use client';

import { UploadButton } from "../components/uploadthing-components";
import { useState } from "react";

interface UploadTriggerProps {
  setImageUrls: (urls: string[]) => void;
}

export function UploadTrigger({ setImageUrls }: UploadTriggerProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="my-4 relative w-full">
      {/* 1. DEIN PERFEKTER BUTTON */}
      <div className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-bold text-white transition-colors ${
        isUploading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
      }`}>
        {isUploading ? "Wird hochgeladen..." : "Bilder hochladen"}
      </div>

      {/* 2. DER UNSICHTBARE LAYER DRÜBER */}
      <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer [&_*]:!w-full [&_*]:!h-full [&_*]:!cursor-pointer">
        <UploadButton
          endpoint="imageUploader"
          content={{
            button: () => " ",
            allowedContent: () => " "
          }}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            setImageUrls(res.map((f) => f.url));
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            alert(`Upload fehlgeschlagen: ${error.message}`);
          }}
        />
      </div>
    </div>
  );
}