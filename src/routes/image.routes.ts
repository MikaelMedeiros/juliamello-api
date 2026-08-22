import { imageHandler } from "../handlers/image-handler";
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
        handler: imageHandler,
    },
]