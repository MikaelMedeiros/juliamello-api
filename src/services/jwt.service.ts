import { JWTPayload, SignJWT, jwtVerify } from "jose";

export interface JwtPayload extends JWTPayload {
  sub: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "STAFF";
  email: string;
  name: string;
}

export class JwtService {

  private readonly secret: Uint8Array;

  constructor(private readonly env: Env) {
    this.secret = new TextEncoder().encode(env.JWT_SECRET);
  }

  async sign(payload: JwtPayload): Promise<string> {

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.secret);

  }

  async verify(token: string): Promise<JwtPayload> {

    const { payload } = await jwtVerify(token, this.secret);

    return {
      sub: payload.sub!,
      organizationId: payload.organizationId as string,
      role: payload.role as JwtPayload["role"],
      email: payload.email as string,
      name: payload.name as string,
    };

  }

}