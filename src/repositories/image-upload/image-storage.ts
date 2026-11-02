import { ImageUploader } from "./image-uploader";
import { ImageDeleter } from "./image-deleter";

export interface ImageStorage extends ImageUploader, ImageDeleter {}