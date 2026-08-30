import { Image } from "../../models/image";

export interface ImageRepository {

  create(
    image: Image
  ): Promise<void>;

  findById(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<Image | null>;

  findBySlot(
    section: string,
    position: number,
    organizationId: string,
    userId: string
  ): Promise<Image | null>;

  findBySection(
    section: string,
    organizationId: string,
    userId: string
  ): Promise<Image[]>;

  delete(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<void>;

  update(
    image: Image
  ): Promise<Image | null>;
}