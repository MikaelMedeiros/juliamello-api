import { ImageResponse } from "./image.response";

export interface SiteResponse {
  banner: ImageResponse[];
  bio: ImageResponse[];
  chatAvatar: ImageResponse[];
  portfolio: ImageResponse[];
  socialProof: ImageResponse[];  
}