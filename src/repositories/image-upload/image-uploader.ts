import { ImageStorageResult } from "./model/image-storage-result.model";
import { ImageUploadOptions } from "./model/image-upload-options.model";

export interface ImageUploader {
  upload(
    file: File,
    options: ImageUploadOptions
  ): Promise<ImageStorageResult>;
}