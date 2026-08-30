import {
  deleteImage,
  getImagesBySection,
  uploadImage,
} from "../handlers/image-handler";

import { jwtAuthMiddleware } from "../middlewares/jwt-auth";
import { rateLimitMiddleware } from "../middlewares/rate-limit";
import { Route } from "../router";

export const imageRoutes: Route[] = [

  // ============================================================
  // Upload / substituição de slot
  //
  // POST /api/images/:section/:position
  //
  // Ex:
  // /api/images/banner/1
  // /api/images/portfolio/1
  // /api/images/portfolio/12
  // ============================================================

  {
    method: "POST",

    pattern:
      /^\/api\/images\/([^\/]+)\/([^\/]+)$/,

    middlewares: [
      rateLimitMiddleware,
      jwtAuthMiddleware,
    ],

    handler: uploadImage,
  },


  // ============================================================
  // Lista imagens da seção
  //
  // GET /api/images/:section
  //
  // Ex:
  // /api/images/portfolio
  // /api/images/banner
  // ============================================================

  {
    method: "GET",

    pattern:
      /^\/api\/images\/([^\/]+)$/,

    middlewares: [
      rateLimitMiddleware,
      jwtAuthMiddleware,
    ],

    handler: getImagesBySection,
  },


  // ============================================================
  // Remove o conteúdo de um slot
  //
  // DELETE /api/images/:section/:position
  //
  // Ex:
  // /api/images/portfolio/3
  //
  // Resultado:
  // Cloudinary -> asset removido
  // D1         -> registro removido
  // Slot       -> vazio
  // ============================================================

  {
    method: "DELETE",

    pattern:
      /^\/api\/images\/([^\/]+)\/([^\/]+)$/,

    middlewares: [
      rateLimitMiddleware,
      jwtAuthMiddleware,
    ],

    handler: deleteImage,
  },
];