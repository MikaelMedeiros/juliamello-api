import { AppException } from "../exceptions/app.exception";
import { ClaimGiftRequest } from "../models/claim-gift.request";
import { Gift } from "../models/gift";
import { GiftRepository } from "../repositories/gift.repository";
import { GiftValidator } from "../validator/gift.validator";

export class GiftService {

  constructor(
    private readonly repository: GiftRepository,
    private readonly expirationMonths: number
  ) {}

  async claim(
    giftId: string,
    request: ClaimGiftRequest
  ): Promise<Gift> {

    GiftValidator.validateClaimRequest(request);

    const gift = await this.repository.findById(giftId);

    GiftValidator.validateClaim(gift);

    gift.claimed = true;
    gift.claimedAt = new Date().toISOString();
    gift.name = request.name;
    gift.phone = request.phone.replace(/\D/g, "");

    const expiresAt = new Date();
    expiresAt.setMonth(
      expiresAt.getMonth() + this.expirationMonths
    );

    gift.expiresAt = expiresAt.toISOString();
    console.log("GiftService.claim: gift =", gift);
    await this.repository.save(gift);

    return gift;
  }

  async validate(
    giftId: string
  ): Promise<Gift> {

    const gift = await this.repository.findById(giftId);

    GiftValidator.validateUse(gift);

    gift.used = true;
    gift.usedAt = new Date().toISOString();

    await this.repository.save(gift);

    return gift;
  }

}