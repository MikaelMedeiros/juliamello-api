import { RequestContext } from "../context";
import { JwtService } from "../services/jwt.service";

export async function jwtAuthMiddleware(
  context: RequestContext
): Promise<Response | null> {

  const auth = context.request.headers.get("Authorization");

  if (!auth) {
    return new Response("Missing Authorization header", {
      status: 401,
    });
  }

  if (!auth.startsWith("Bearer ")) {
    return new Response("Invalid Authorization header", {
      status: 401,
    });
  }

  const token = auth.substring(7);

  try {

    const payload = await new JwtService(context.env).verify(token);

    context.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      organizationId: payload.organizationId,
      role: payload.role
    };

    return null;

  } catch (e) {

    console.error(e);

    return new Response("Unauthorized", {
      status: 401,
    });

  }

}