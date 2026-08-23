import { Image } from "../models/image";
import { ImageResponse } from "../models/image.response";
import { ImageStorage } from "../repositories/image-upload/image-storage";
import { ImageRepository } from "../repositories/image-upload/image.repository";

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

    const userSlug = email.split("@")[0];
    
    const folder =`${organizationSlug}/${userSlug}/${section}`;

    const key = crypto.randomUUID();

    const storageKey = `${folder}/${key}`;

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
        section: section,
        createdAt: new Date().toISOString(),
      };      

      await this.repository.create(image);

      return {
        id: image.id,
        url: image.url,
        width: image.width,
        height: image.height,
        filename: image.filename,
        section: image.section,
        contentType: image.contentType,
        size: image.size
      };

    } catch (error) {

      // Se a imagem chegou na Cloudinary mas o D1 falhou,
      // tenta remover a imagem para não deixar lixo no storage.      
      try {
        await this.storage.delete(storageKey);
      } catch {
        throw new Error(`Failed to delete image from storage after D1 failure AND: ${error}`);              
      }

      throw error;
    }
  }

  async findBySection(
    section: string,
    organizationId: string,
    userId: string
  ): Promise<Image[]> {
    return this.repository.findBySection(section, organizationId, userId);
  }

  async delete(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<void> {
    try {
      const imageUploaded = await this.repository.findById(id, organizationId, userId);
      if (!imageUploaded) {
        throw new Error(`Image with id ${id} not found for the given organization and user.`);
      }
      await this.storage.delete(imageUploaded.key);
      await this.repository.delete(id, organizationId, userId);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    organizationSlug: string,
    email: string,
    file: File,
    section: string
  ): Promise<ImageResponse> {

    const imageUploaded = await this.repository.findById(
      id,
      organizationId,
      userId
    );

    if (!imageUploaded) {
      throw new Error(`Image with id ${id} not found for the given organization and user.`);
    }

    const userSlug = email.split("@")[0];
    const folder = `${organizationSlug}/${userSlug}/${section}`;
    const key = crypto.randomUUID();
    const storageResult = await this.storage.upload(
      key,
      folder,
      file
    );

    const image: Image = {
      ...imageUploaded,
      key: storageResult.key,
      url: storageResult.url,
      width: storageResult.width,
      height: storageResult.height,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      section,
    };

    const updatedImage = await this.repository.update(image);
    if (!updatedImage) {
      throw new Error(`Failed to update image with id ${id}.`);
    }

    await this.storage.delete(imageUploaded.key);

    return {
      id: updatedImage.id,
      url: updatedImage.url,
      width: updatedImage.width,
      height: updatedImage.height,
      filename: updatedImage.filename,
      section: updatedImage.section,
      contentType: updatedImage.contentType,
      size: updatedImage.size,
    };

  }
}                 