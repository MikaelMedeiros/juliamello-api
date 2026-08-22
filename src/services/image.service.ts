import { Image } from "../models/image";
import { ImageResponse } from "../models/image.response";
import { ImageStorage } from "../repositories/image-upload/image-storage";
import { ImageRepository } from "../repositories/image-upload/image.repository";
import { ImageUploadValidator } from "../validator/file-upload.validator";

export class ImageService {

  constructor(
    private readonly storage: ImageStorage,
    private readonly repository: ImageRepository
  ) {}

  async upload(
    organizationId: string,
    userId: string,
    organizationSlug: string,
    email: string,
    file: File,
    section: string
  ): Promise<ImageResponse> {    

    const id = crypto.randomUUID();

    const key = crypto.randomUUID();

    const userSlug = email.split("@")[0];

    const folder =`${organizationSlug}/${userSlug}/${section}`;

    try {

      const storageResult = await this.storage.upload(
        key,
        folder,
        file
      );

      const image: Image = {
        id,
        organizationId,
        userId,
        key: storageResult.key,
        url: storageResult.url,
        width: storageResult.width,
        height: storageResult.height,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        section: "portfolio",
        createdAt: new Date().toISOString(),
      };

      await this.repository.create(image);

      return {
        id: image.id,
        url: image.url,
        width: image.width,
        height: image.height,
        filename: image.filename,
        contentType: image.contentType,
        size: image.size
      };

    } catch (error) {

      // Se a imagem chegou na Cloudinary mas o D1 falhou,
      // tenta remover a imagem para não deixar lixo no storage.
      try {
        await this.storage.delete(key);
      } catch {
        // Mantém o erro original.
      }

      throw error;
    }
  }
}