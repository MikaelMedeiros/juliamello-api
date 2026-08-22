  import { RequestContext } from "../context";
  import { AppException } from "../exceptions/app.exception";
  import { handleError } from "../exceptions/erro.handler";
import { CloudinaryImageStorageRepository } from "../repositories/image-upload/cloudinary-image-storage";
  import { D1ImageRepository } from "../repositories/image-upload/d1-image.repository";

  import { json } from "../response";
  import { ImageService } from "../services/image.service";
  import { ImageUploadValidator } from "../validator/file-upload.validator";

  export async function imageHandler(
    context: RequestContext
  ): Promise<Response> {

    const {
      request,
      env,
      corsHeaders,
      user
    } = context;

    try {

      const formData = await request.formData();

      const file = formData.get("file");
      const section = formData.get("section") as string;

      if (!(file instanceof File)) {
        throw new AppException(
          "Arquivo não enviado.",
          400
        );
      }

      ImageUploadValidator.validate(file, section);

      const service = new ImageService(
        new CloudinaryImageStorageRepository(
          env.CLOUDINARY_CLOUD_NAME,
          env.CLOUDINARY_API_KEY,
          env.CLOUDINARY_API_SECRET
        ),
        new D1ImageRepository(env.app_db)
      );


    const image = await service.upload(
      context.user?.organizationId ?? "default",
      context.user?.id ?? "default",
      context.user?.organizationSlug ?? "default",
      context.user?.email ?? "default",
      file,
      section
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