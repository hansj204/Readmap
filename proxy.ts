// ─────────────────────────────────────────────────────────────
// proxy.ts 
// - 모든 요청이 페이지나 API에 도착하기 "전에" 이 함수를 거칩니다
// - 프로젝트에 하나만 둘 수 있고, 위치는 app 폴더와 같은 높이(루트)입니다
// - 기본으로 Node.js 런타임에서 실행됩니다
// ─────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from "next/server";

// lib/auth.ts가 아니라 lib/session.ts를 씁니다
// proxy에서는 request.cookies로 쿠키를 바로 읽을 수 있어서 next/headers가 필요 없습니다
import { COOKIE, verifyToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
    // 1. 쿠키의 토큰이 진짜면 그대로 통과
    if (await verifyToken(request.cookies.get(COOKIE)?.value)) {
        return NextResponse.next();
    }

    // 2. API 요청이면 로그인 페이지로 보내지 않고 401(인증 필요)을 돌려줍니다
    //    (fetch로 호출하는 쪽이 HTML 로그인 페이지를 받으면 처리하기 곤란하기 때문)
    if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 3. 페이지 요청이면 /login으로 보내면서, 원래 주소를 next에 담아 둡니다
    //    예: /save?url=https://blog.com → /login?next=/save?url=https://blog.com
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
}

// matcher: proxy를 실행할 경로
// 아래 목록에 있는 경로는 로그인 없이 접근할 수 있어야 하므로 제외합니다
// - login: 로그인 페이지 자체 (막으면 무한 리다이렉트)
// - _next/static, _next/image: Next.js가 만드는 JS, CSS, 이미지 파일
// - favicon.ico, manifest.webmanifest: 브라우저가 자동으로 요청하는 파일
export const config = {
    matcher: ["/((?!login|_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"],
};
