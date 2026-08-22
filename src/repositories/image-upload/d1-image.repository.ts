import { Image } from "../../models/image";
import { ImageRepository } from "./image.repository";

export class D1ImageRepository
  implements ImageRepository {

  constructor(
    private readonly db: D1Database
  ) {}

  async create(
    image: Image
  ): Promise<void> {

    await this.db
      .prepare(`
        INSERT INTO images (
          id,
          organization_id,
          user_id,
          key,
          url,
          width,
          height,
          filename,
          content_type,
          size,
          section,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        image.id,
        image.organizationId,
        image.userId,
        image.key,
        image.url,
        image.width,
        image.height,
        image.filename,
        image.contentType,
        image.size,
        image.section,
        image.createdAt
      )
      .run();
  }

  async findByIdAndOrganizationId(
    id: string,
    organizationId: string
  ): Promise<Image | null> {

    const result = await this.db
      .prepare(`
        SELECT
          id,
          organization_id,
          user_id,
          key,
          url,
          width,
          height,
          filename,
          content_type,
          size,
          created_at
        FROM images
        WHERE id = ?
          AND organization_id = ?
      `)
      .bind(id, organizationId)
      .first();

    if (!result) {
      return null;
    }

    return {
      id: result.id as string,
      organizationId: result.organization_id as string,
      userId: result.user_id as string,
      key: result.key as string,
      url: result.url as string,
      width: result.width as number,
      height: result.height as number,
      filename: result.filename as string,
      contentType: result.content_type as string,
      size: result.size as number,
      section: result.section as string,
      createdAt: result.created_at as string,
    };
  }

  async delete(
    id: string
  ): Promise<void> {

    await this.db
      .prepare(`
        DELETE FROM images
        WHERE id = ?
      `)
      .bind(id)
      .run();
  }
}