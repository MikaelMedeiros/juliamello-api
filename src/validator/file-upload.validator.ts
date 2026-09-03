import { AppException } from "../exceptions/app.exception";

export class ImageUploadValidator {

  static validate(file: File , section: string, position: number): void {

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];

    const allowedSections = [
        "banner",
        "bio",
        "avatar-chat",
        "social-proof",
        "portfolio"
    ] as const;

    if (!allowedTypes.includes(file.type)) {
      throw new AppException(        
        "Tipo de arquivo não permitido.",
        400
      );
    }

    if (!allowedSections.includes(section as typeof allowedSections[number])) {
      throw new AppException(
        "Seção de imagem inválida.",
        400
      );
    }

    if (!file.name) {
      throw new AppException(
        "Arquivo sem nome.",
        400
      );
    }

    if (!file.size) {
      throw new AppException(
        "Arquivo vazio.",
        400
      );
    }

    if (file.size <= 0) {
      throw new AppException(
        "Arquivo vazio.",
        400
      );
    }

    const maxPosition = 12; // Maximum position allowed
    const minPosition = 1; // Minimum position allowed

    if (
      !Number.isInteger(position) ||
      position < minPosition ||
      position > maxPosition
    ) {

      throw new AppException(
        "Posição de imagem inválida.",
        400
      );
    }


    const maxSize = 5 * 1024 * 1024;
    

    if (file.size > maxSize) {
      throw new AppException(
        "Arquivo muito grande. Limite de 5MB.",
        400
      );
    }

    
  }
}