import { cookies } from "next/headers";
import { COOKIE, signToken, verifyToken } from "./session";

// 로그인 성공 시 호출: 서명한 토큰을 쿠키로 저장합니다
export async function createSession() {
    (await cookies()).set(COOKIE, await signToken(), {
        httpOnly: true,                                  // 자바스크립트로 읽을 수 없음 (탈취 방지)
        secure: process.env.NODE_ENV === "production",   // 배포 환경에서는 HTTPS로만 전송
        sameSite: "lax",                                 // 다른 사이트의 몰래 보내는 POST에는 안 붙음
        path: "/",                                       // 사이트 전체에서 사용
        maxAge: 60 * 60 * 24 * 30,                       // 30일 (토큰 만료와 맞춤)
    });
}

// Route Handler, Server Component에서 호출: 지금 요청이 주인인지 확인합니다
export async function isOwner() {
    return verifyToken((await cookies()).get(COOKIE)?.value);
}
