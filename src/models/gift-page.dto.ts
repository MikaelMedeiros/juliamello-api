import { Gift } from "./gift";

export interface GiftPageDto {
  items: Gift[];
  cursor?: string;
  hasNext: boolean;
}