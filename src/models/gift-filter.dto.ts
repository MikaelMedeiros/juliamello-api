export interface GiftFilterDto {
  cursor?: string;
  pageSize: number;
  claimed?: boolean;
  used?: boolean;
}