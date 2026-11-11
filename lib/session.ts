import { SignJWT, jwtVerify } from "jose";

// 브라우저에 저장될 쿠키 이름
export const COOKIE = "readmap_session";

// .env.local의 SESSION_SECRET을 서명 키로 사용합니다
const key = new TextEncoder().encode(process.env.SESSION_SECRET);

// 로그인 성공 시: "주인이 맞음"이라는 내용을 담고 서명한 토큰을 만듭니다 (30일 유효)
export function signToken() {
    return new SignJWT({ sub: "owner" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(key);
}

// 요청마다: 쿠키의 토큰이 내 키로 서명됐고 만료되지 않았는지 확인합니다
export async function verifyToken(token?: string) {
    if (!token) return false;
    try {
        await jwtVerify(token, key);
        return true;
    } catch {
        return false; // 위조, 변조, 만료 모두 여기로 옵니다
    }
}
