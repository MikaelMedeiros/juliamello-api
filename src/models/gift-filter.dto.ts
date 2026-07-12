export interface GiftFilterDto {
  page: number;
  pageSize: number;

  claimed?: boolean;
  used?: boolean;

  name?: string;
  phone?: string;

  expirationStart?: string;
  expirationEnd?: string;
}