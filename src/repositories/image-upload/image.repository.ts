import { Image } from "../../models/image";

export interface ImageRepository {

  create(
    image: Image
  ): Promise<void>;

  findByIdAndOrganizationId(
    id: string,
    organizationId: string
  ): Promise<Image | null>;

  delete(
    id: string
  ): Promise<void>;
}