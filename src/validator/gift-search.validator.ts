import { AppException } from "../exceptions/app.exception";
import { GiftFilterDto } from "../models/gift-filter.dto";

export class GiftSearchValidator {

  static validate(
    filter: GiftFilterDto | undefined
  ): void {

    if (!filter) {
      throw new AppException(
          "O corpo da requisição é obrigatório.",
          400,
      );
    }

    if (filter.page === undefined) {
      throw new AppException(
          "O campo 'page' é obrigatório.",
          400,
      );
    }

    if (!Number.isInteger(filter.page) || filter.page < 1) {
      throw new AppException(
          "O campo 'page' deve ser um inteiro maior que zero.",
          400,
      );
    }

    if (filter.pageSize === undefined) {
      throw new AppException(
          "O campo 'pageSize' é obrigatório.",
          400,
      );
    }

    if (
      !Number.isInteger(filter.pageSize) ||
      filter.pageSize < 1 ||
      filter.pageSize > 100
    ) {
      throw new AppException(
          "O campo 'pageSize' deve estar entre 1 e 100.",
          400,
      );
    }

    if (
      filter.expirationStart &&
      Number.isNaN(Date.parse(filter.expirationStart))
    ) {
      throw new AppException(
          "expirationStart é uma data inválida.",
          400,
      );
    }

    if (
      filter.expirationEnd &&
      Number.isNaN(Date.parse(filter.expirationEnd))
    ) {
      throw new AppException(
          "expirationEnd é uma data inválida.",
          400,
      );
    }

    if (
      filter.expirationStart &&
      filter.expirationEnd &&
      new Date(filter.expirationStart) >
      new Date(filter.expirationEnd)
    ) {
      throw new AppException(
        "expirationStart não pode ser maior que expirationEnd.",
        400
      );
    }

  }

}