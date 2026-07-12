import { Gift } from "../models/gift";
import { GiftFilterDto } from "../models/gift-filter.dto";
import { GiftPageDto } from "../models/gift-page.dto";
import { GiftRepository } from "./gift.repository";

export class D1GiftRepository implements GiftRepository {

  constructor(
    private readonly env: Env
  ) {}

  async findById(id: string): Promise<Gift | null> {

    const gift = await this.env.app_db
      .prepare(`
        SELECT
          id,
          name,
          phone,
          claimed,
          used,
          created_at as createdAt,
          expires_at as expiresAt,
          claimed_at as claimedAt,
          used_at as usedAt
        FROM gifts
        WHERE id = ?
      `)
      .bind(id)
      .first<Gift>();

    return gift ?? null;
  }

  async findAll(
    filter: GiftFilterDto
  ): Promise<GiftPageDto> {

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.claimed !== undefined) {
      conditions.push("claimed = ?");
      params.push(filter.claimed ? 1 : 0);
    }

    if (filter.used !== undefined) {
      conditions.push("used = ?");
      params.push(filter.used ? 1 : 0);
    }

    if (filter.name) {
        conditions.push("LOWER(name) LIKE LOWER(?)");
        params.push(`%${filter.name}%`);
    }

    if (filter.phone) {
        conditions.push("phone LIKE ?");
        params.push(`%${filter.phone}%`);
    }

    if (filter.expirationStart) {
        conditions.push("expires_at >= ?");
        params.push(filter.expirationStart);
    }

    if (filter.expirationEnd) {
        conditions.push("expires_at <= ?");
        params.push(filter.expirationEnd);
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const offset = (filter.page - 1) * filter.pageSize;

    const countResult = await this.env.app_db
      .prepare(`
        SELECT COUNT(*) as total
        FROM gifts
        ${where}
      `)
      .bind(...params)
      .first<{ total: number }>();

    const query = await this.env.app_db
      .prepare(`
        SELECT
          id,
          name,
          phone,
          claimed,
          used,
          created_at as createdAt,
          expires_at as expiresAt,
          claimed_at as claimedAt,
          used_at as usedAt
        FROM gifts
        ${where}
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?
      `)
      .bind(
        ...params,
        filter.pageSize,
        offset
      )
      .run<Gift>();

    return {
      items: query.results ?? [],
      total: countResult?.total ?? 0,
      page: filter.page,
      pageSize: filter.pageSize
    };
  }

  async save(gift: Gift): Promise<void> {

    await this.env.app_db
      .prepare(`
        INSERT INTO gifts (
          id,
          name,
          phone,
          claimed,
          used,
          created_at,
          expires_at,
          claimed_at,
          used_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id)
        DO UPDATE SET
          name = excluded.name,
          phone = excluded.phone,
          claimed = excluded.claimed,
          used = excluded.used,
          created_at = excluded.created_at,
          expires_at = excluded.expires_at,
          claimed_at = excluded.claimed_at,
          used_at = excluded.used_at
      `)
      .bind(
        gift.id,
        gift.name,
        gift.phone,
        gift.claimed ? 1 : 0,
        gift.used ? 1 : 0,
        gift.createdAt,
        gift.expiresAt,
        gift.claimedAt,
        gift.usedAt
      )
      .run();
  }

}