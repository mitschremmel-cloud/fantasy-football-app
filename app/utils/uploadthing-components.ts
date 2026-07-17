import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

export const UploadButton = generateUploadButton<OurFileRouter>();
