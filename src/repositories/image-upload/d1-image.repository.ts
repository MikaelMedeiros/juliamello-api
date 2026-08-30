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
          position,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        image.position,
        image.createdAt
      )
      .run();
  }

  async findById(
    id: string,
    organizationId: string,
    userId: string
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
          section,
          position,
          created_at
        FROM images
        WHERE id = ?
          AND organization_id = ?
          AND user_id = ?
      `)
      .bind(
        id,
        organizationId,
        userId
      )
      .first();

    if (!result) {
      return null;
    }

    return this.mapImage(result);
  }

  async findBySlot(
    section: string,
    position: number,
    organizationId: string,
    userId: string
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
          section,
          position,
          created_at
        FROM images
        WHERE section = ?
          AND position = ?
          AND organization_id = ?
          AND user_id = ?
      `)
      .bind(
        section,
        position,
        organizationId,
        userId
      )
      .first();

    if (!result) {
      return null;
    }

    return this.mapImage(result);
  }

  async findBySection(
    section: string,
    organizationId: string,
    userId: string
  ): Promise<Image[]> {

    const results = await this.db
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
          section,
          position,
          created_at
        FROM images
        WHERE section = ?
          AND organization_id = ?
          AND user_id = ?
        ORDER BY position ASC
      `)
      .bind(
        section,
        organizationId,
        userId
      )
      .all();

    return results.results.map(
      (result: any) => this.mapImage(result)
    );
  }

  async delete(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<void> {

    await this.db
      .prepare(`
        DELETE FROM images
        WHERE id = ?
          AND organization_id = ?
          AND user_id = ?
      `)
      .bind(
        id,
        organizationId,
        userId
      )
      .run();
  }

  async update(
    image: Image
  ): Promise<Image | null> {

    const result = await this.db
      .prepare(`
        UPDATE images
        SET
          url = ?,
          width = ?,
          height = ?,
          filename = ?,
          content_type = ?,
          size = ?
        WHERE id = ?
          AND organization_id = ?
          AND user_id = ?
      `)
      .bind(
        image.url,
        image.width,
        image.height,
        image.filename,
        image.contentType,
        image.size,
        image.id,
        image.organizationId,
        image.userId
      )
      .run();

    if (result.meta.changes === 0) {
      return null;
    }

    return image;
  }

  private mapImage(
    result: Record<string, unknown>
  ): Image {

    return {
      id: result.id as string,
      organizationId:
        result.organization_id as string,
      userId:
        result.user_id as string,
      key:
        result.key as string,
      url:
        result.url as string,
      width:
        result.width as number,
      height:
        result.height as number,
      filename:
        result.filename as string,
      contentType:
        result.content_type as string,
      size:
        result.size as number,
      section:
        result.section as string,
      position:
        result.position as number,
      createdAt:
        result.created_at as string,
    };
  }
}