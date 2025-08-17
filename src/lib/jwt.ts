import jwt from "jsonwebtoken";

type JwtPayload = { userId: string; role: "User" | "Admin" };

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN || 3600),
  });
}
export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN || 1209600),
  });
}
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
}
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
}
