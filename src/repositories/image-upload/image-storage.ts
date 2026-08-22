import { ImageStorageResult } from "./model/image-storage-result.model";

export interface ImageStorage {

  upload(
    key: string,
    folder: string,
    file: File
  ): Promise<ImageStorageResult>;

  delete(
    key: string
  ): Promise<void>;
}