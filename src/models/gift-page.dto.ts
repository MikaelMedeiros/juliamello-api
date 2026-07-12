import { Gift } from "./gift";

export interface GiftPageDto {
    items: Gift[];
    total: number;
    page: number;
    pageSize: number;
}