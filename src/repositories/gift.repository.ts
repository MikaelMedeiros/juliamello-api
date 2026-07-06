import { Gift } from "../models/gift";
import { GiftFilterDto } from "../models/gift-filter.dto";
import { GiftPageDto } from "../models/gift-page.dto";

export interface GiftRepository {

  findById(id: string): Promise<Gift | null>;

  findAll(
    filter: GiftFilterDto
  ): Promise<GiftPageDto>;

  save(gift: Gift): Promise<void>;

}