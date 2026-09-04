import { RequestContext } from "../context";
import { AppException } from "../exceptions/app.exception";
import { handleError } from "../exceptions/erro.handler";
import { CloudinaryImageStorageRepository } from "../repositories/image-upload/cloudinary-image-storage";
import { D1ImageRepository } from "../repositories/image-upload/d1-image.repository";

import { json, noContent } from "../response";
import { ImageService } from "../services/image.service";
import { ImageUploadValidator } from "../validator/file-upload.validator";

export async function uploadImage(
  context: RequestContext
): Promise<Response> {

  const {
    request,
    env,
    corsHeaders
  } = context;

  try {

    // ==========================================================
    // A seção e o slot vêm da URL
    //
    // /api/images/portfolio/3
    //
    // params[1] = portfolio
    // params[2] = 3
    // ==========================================================

    const section =
      context.params[1];

    const position =
      Number(context.params[2]);

    // ==========================================================
    // Arquivo
    // ==========================================================

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {

      throw new AppException(
        "Arquivo não enviado.",
        400
      );
    }

    // ==========================================================
    // Validação do arquivo
    // ==========================================================

    ImageUploadValidator.validate(
      file,
      section,
      position
    );


    // ==========================================================
    // Service
    // ==========================================================

    const service =
      new ImageService(

        new CloudinaryImageStorageRepository(
          env.CLOUDINARY_CLOUD_NAME,
          env.CLOUDINARY_API_KEY,
          env.CLOUDINARY_API_SECRET
        ),

        new D1ImageRepository(
          env.app_db
        )
      );


    // ==========================================================
    // Upload ou overwrite do slot
    // ==========================================================

    const image =
      await service.upload(

        context.user?.organizationId
          ?? "default",

        context.user?.id
          ?? "default",

        context.user?.organizationSlug
          ?? "default",

        file,

        section,

        position
      );


    return json(
      image,
      corsHeaders
    );

  } catch (error) {

    return handleError(
      error,
      corsHeaders
    );
  }
}

export async function getImagesBySection(
  context: RequestContext
): Promise<Response> {
  const {
    env,
    corsHeaders
  } = context;

  try {
    const section = context.params[1];

    const service = new ImageService(
      new CloudinaryImageStorageRepository(
        env.CLOUDINARY_CLOUD_NAME,
        env.CLOUDINARY_API_KEY,
        env.CLOUDINARY_API_SECRET
      ),
      new D1ImageRepository(env.app_db)
    );     

    const images = await service.findBySection(
      section,
      context.user?.organizationId ?? "default",
      context.user?.id ?? "default"
    );  

    return json(
      images,
      corsHeaders
    );
  } catch (error) {
    return handleError(
      error,
      corsHeaders
    );
  }
}

export async function deleteImage(
  context: RequestContext
): Promise<Response> {

  const {
    env,
    corsHeaders
  } = context;

  try {

    const section =
      context.params[1];

    const position =
      Number(context.params[2]);

    if (
      !Number.isInteger(position) ||
      position < 1 ||
      position > 12
    ) {

      throw new AppException(
        "Posição de imagem inválida.",
        400
      );
    }

    const service =
      new ImageService(

        new CloudinaryImageStorageRepository(
          env.CLOUDINARY_CLOUD_NAME,
          env.CLOUDINARY_API_KEY,
          env.CLOUDINARY_API_SECRET
        ),

        new D1ImageRepository(
          env.app_db
        )
      );

    await service.deleteBySlot(
      section,
      position,
      context.user?.organizationId
        ?? "default",
      context.user?.id
        ?? "default"
    );

    return noContent(
      corsHeaders
    );

  } catch (error) {

    return handleError(
      error,
      corsHeaders
    );
  }
}
