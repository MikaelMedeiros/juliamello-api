import { deleteImage, getImagesBySection, updateImage, uploadNewImage } from "../handlers/image-handler";
import { jwtAuthMiddleware } from "../middlewares/jwt-auth";
import { rateLimitMiddleware } from "../middlewares/rate-limit";
import { Route } from "../router";

export const imageRoutes: Route[] = [
    {
        method: "POST",
        pattern: /^\/api\/images$/,
        middlewares: [
            rateLimitMiddleware,
            jwtAuthMiddleware,
        ],
        handler: uploadNewImage,
    },
    {
        method: "GET",
        pattern: /^\/api\/images\/([^\/]+)$/,
        middlewares: [
            rateLimitMiddleware,
            jwtAuthMiddleware,
        ],
        handler: getImagesBySection,
    },
    {
        method: "DELETE",
        pattern: /^\/api\/images\/([^\/]+)$/,
        middlewares: [
            rateLimitMiddleware,
            jwtAuthMiddleware,
        ],
        handler: deleteImage,
    },
    {
        method: "PUT",
        pattern: /^\/api\/images\/([^\/]+)$/,
        middlewares: [
            rateLimitMiddleware,
            jwtAuthMiddleware,
        ],
        handler: updateImage,
    }
]