import { googleLogin } from "../handlers/auth/google-login.handler"
import { Route } from "../router"

export const authRoutes: Route[] = [

    {
        method: "POST",
        pattern: /^\/api\/auth\/google\/login$/,
        handler: googleLogin
    }
]

