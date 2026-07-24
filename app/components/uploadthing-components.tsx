import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "../utils/uploadthing";

export const UploadButton = generateUploadButton<OurFileRouter>();
