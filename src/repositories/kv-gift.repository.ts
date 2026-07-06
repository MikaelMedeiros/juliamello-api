
import { Gift } from "../models/gift";
import { GiftFilterDto } from "../models/gift-filter.dto";
import { GiftPageDto } from "../models/gift-page.dto";
import { GiftRepository } from "./gift.repository";

export class KvGiftRepository implements GiftRepository {

  constructor(
    private readonly env: Env
  ) {}

  async findById(id: string): Promise<Gift | null> {

    const raw = await this.env.GIFTS.get(`gift:${id}`);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  }

  async findAll(
    filter: GiftFilterDto
  ): Promise<GiftPageDto> {

    const result = await this.env.GIFTS.list({
      prefix: "gift:",
      cursor: filter.cursor,
      limit: filter.pageSize
    });

    const gifts = await Promise.all(
      result.keys.map(async (key) => {

        const raw = await this.env.GIFTS.get(key.name);

        if (!raw) {
          return null;
        }

        return JSON.parse(raw);

      })
    );

    const items = gifts
      .filter((gift): gift is Gift => gift !== null)
      .filter(gift => {

        if (
          filter.claimed !== undefined &&
          gift.claimed !== filter.claimed
        ) {
          return false;
        }

        if (
          filter.used !== undefined &&
          gift.used !== filter.used
        ) {
          return false;
        }

        return true;
      });

    return {
      items,
      cursor: result.list_complete ? undefined : result.cursor,
      hasNext: !result.list_complete
    };
  }

  async save(gift: Gift): Promise<void> {

    await this.env.GIFTS.put(
      `gift:${gift.id}`,
      JSON.stringify(gift)
    );
  }

}