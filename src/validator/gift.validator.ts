import { AppException } from "../exceptions/app.exception";
import { ClaimGiftRequest } from "../models/claim-gift.request";
import { Gift } from "../models/gift";

export class GiftValidator {

  static validateClaimRequest(
    request: ClaimGiftRequest
  ): void {

    if (!request?.name?.trim()) {
      throw new AppException(
        "Faltou informar o nome :(",
        400
      );
    }

    if (!request?.phone?.trim()) {
      throw new AppException(
        "Esqueceu de digitar seu WhatsApp u_u",
        400
      );
    }

    const phone = request.phone.trim();

    if (!/^\+?\d{8,15}$/.test(phone)) {
      throw new AppException(
        "WhatsApp inválido.",
         400
      );
    }

  }

  static validateClaim(
    gift: Gift | null
  ): asserts gift is Gift {

    if (!gift) {
      throw new AppException(
        "Esse gift não existe e_e",
        404
      );
    }

    if (gift.used) {
      throw new AppException(
        "Esse gift já foi utilizado e-e",
        409
      );
    }

    if (gift.claimed) {
      throw new AppException(
        "Já resgataram esse, hein e-e",
        409
      );
    }

  }

  static validateUse(
    gift: Gift | null
  ): asserts gift is Gift {

    if (!gift) {
      throw new AppException(
        "Não encontrei esse Gift :/",
        404
      );
    }

    if (gift.used) {
      throw new AppException(
        "Esse gift já foi utilizado :(",
        409
      );
    }

    if (!gift.claimed) {
      throw new AppException(
        "Impossível usar um Gift que não foi resgatado ¬¬",
        409
      );
    }

    if (!gift.expiresAt) {
      throw new AppException(
        "Gift inválido.",
        500
      );
    }

    if (new Date(gift.expiresAt) < new Date()) {
      throw new AppException(
        "Demorou muito para usar e acabou expirando ):",
        409
      );
    }

  }

}