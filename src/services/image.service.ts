import { Image } from "../models/image";
import { ImageResponse } from "../models/image.response";
import { ImageStorage } from "../repositories/image-upload/image-storage";
import { ImageRepository } from "../repositories/image-upload/image.repository";

const SINGLE_IMAGE_SECTIONS =
  new Set([
    "banner",
    "avatar-chat",
    "about",
  ]);

const MAX_GALLERY_IMAGES = 12;

export class ImageService {

  constructor(
    private readonly storage: ImageStorage,
    private readonly repository: ImageRepository
  ) {}

  async upload(
    organizationId: string,
    userId: string,
    organizationSlug: string,
    file: File,
    section: string,
    position: number
  ): Promise<ImageResponse> {

    this.validatePosition(
      section,
      position
    );

    // --------------------------------------------------------
    // Procura se esse slot já possui uma imagem.
    // --------------------------------------------------------

    const existingImage =
      await this.repository.findBySlot(
        section,
        position,
        organizationId,
        userId
      );

    // --------------------------------------------------------
    // Define o caminho permanente do Cloudinary.
    // --------------------------------------------------------

    const storagePath =
      createImageStoragePath(
        organizationSlug,
        section,
        position
      );

    // --------------------------------------------------------
    // Cloudinary:
    //
    // se existir -> overwrite
    // se não existir -> create
    //
    // O public_id permanece o mesmo.
    // --------------------------------------------------------

    const storageResult =
      await this.storage.upload(
        storagePath.publicId,
        storagePath.folder,
        file
      );

    const image: Image = {

      // ------------------------------------------------------
      // O slot existente mantém seu UUID.
      //
      // Primeiro upload:
      // cria UUID.
      //
      // Atualização:
      // mantém UUID.
      // ------------------------------------------------------

      id:
        existingImage?.id
        ?? crypto.randomUUID(),

      organizationId,

      userId,

      // ------------------------------------------------------
      // IMPORTANTE:
      // não é mais UUID.
      //
      // É o public_id permanente do Cloudinary.
      // ------------------------------------------------------

      key:
        storageResult.key,

      url:
        storageResult.url,

      width:
        storageResult.width,

      height:
        storageResult.height,

      filename:
        file.name,

      contentType:
        file.type,

      size:
        file.size,

      section,

      position,

      // ------------------------------------------------------
      // Uma substituição não altera createdAt.
      // ------------------------------------------------------

      createdAt:
        existingImage?.createdAt
        ?? new Date().toISOString(),
    };

    // --------------------------------------------------------
    // Slot já existente -> UPDATE
    // --------------------------------------------------------

    if (existingImage) {

      const updated =
        await this.repository.update(
          image
        );

      if (!updated) {

        throw new Error(
          "Failed to update image slot."
        );
      }

      return this.toResponse(
        updated
      );
    }

    // --------------------------------------------------------
    // Slot ainda vazio -> CREATE
    // --------------------------------------------------------

    await this.repository.create(
      image
    );

    return this.toResponse(
      image
    );
  }

  async findBySection(
    section: string,
    organizationId: string,
    userId: string
  ): Promise<Image[]> {

    return this.repository.findBySection(
      section,
      organizationId,
      userId
    );
  }

  async deleteBySlot(
    section: string,
    position: number,
    organizationId: string,
    userId: string
  ): Promise<void> {

    const image =
      await this.repository.findBySlot(
        section,
        position,
        organizationId,
        userId
      );

    // Slot já está vazio.
    if (!image) {
      return;
    }

    await this.storage.delete(
      image.key
    );

    await this.repository.delete(
      image.id,
      organizationId,
      userId
    );
  }

  private validatePosition(
    section: string,
    position: number
  ): void {

    if (
      !Number.isInteger(position) ||
      position < 1
    ) {

      throw new Error(
        "Invalid image position."
      );
    }

    // Seção de imagem única.
    if (
      SINGLE_IMAGE_SECTIONS.has(section)
      && position !== 1
    ) {

      throw new Error(
        `Section ${section} only supports position 1.`
      );
    }

    // Galerias.
    if (
      !SINGLE_IMAGE_SECTIONS.has(section)
      && position > MAX_GALLERY_IMAGES
    ) {

      throw new Error(
        `Section ${section} supports a maximum of ${MAX_GALLERY_IMAGES} images.`
      );
    }
  }

  private toResponse(
    image: Image
  ): ImageResponse {

    return {

      id:
        image.id,

      url:
        image.url,

      width:
        image.width,

      height:
        image.height,

      filename:
        image.filename,

      section:
        image.section,

      position:
        image.position,

      contentType:
        image.contentType,

      size:
        image.size,
    };
  }
}


function createImageStoragePath(
  organizationSlug: string,
  section: string,
  position: number
): {
  folder: string;
  publicId: string;
} {

  if (
    SINGLE_IMAGE_SECTIONS.has(section)
  ) {

    return {
      folder: organizationSlug,
      publicId: section,
    };
  }

  return {
    folder:
      `${organizationSlug}/${section}`,

    publicId:
      `slot-${String(position).padStart(2, "0")}`,
  };
}