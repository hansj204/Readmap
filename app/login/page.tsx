// ─────────────────────────────────────────────────────────────
// /login 페이지
// App Router에서는 폴더 이름이 곧 주소입니다: app/login/page.tsx → /login
// ─────────────────────────────────────────────────────────────

// "@/"는 프로젝트 루트를 가리키는 별칭입니다 (tsconfig.json의 paths 설정)
import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { Suspense } from "react";

// Server Action
// - "use server"가 붙은 함수는 브라우저가 아니라 서버에서 실행됩니다
// - <form action={login}>으로 연결하면 제출할 때 Next.js가 서버에서 이 함수를 호출합니다
// - 그래서 로그인용 API를 따로 만들 필요가 없고, 비밀번호 비교도 서버에서만 일어납니다
async function login(formData: FormData) {
    "use server";

    // 환경 변수가 비어 있으면 즉시 실패시킵니다
    // (String(undefined)는 문자열 "undefined"가 되어,
    //  비밀번호 칸에 "undefined"를 치면 로그인되는 구멍이 생기기 때문)
    const owner = process.env.PASSWORD;
    if (!owner) throw new Error("PASSWORD 환경 변수가 설정되지 않았습니다");

    const input = Buffer.from(String(formData.get("password") ?? ""));
    const expected = Buffer.from(owner);

    // 로그인 후 돌아갈 주소 (proxy.ts가 /login?next=/원래주소 로 보내 줌)
    const next = String(formData.get("next") ?? "/");

    // timingSafeEqual
    // - 일반 비교(===)는 앞 글자부터 비교하다 틀리면 바로 멈춰서,
    //   응답 시간으로 몇 글자까지 맞았는지 추측할 수 있습니다 (타이밍 공격)
    // - timingSafeEqual은 내용과 상관없이 항상 같은 시간이 걸립니다
    // - 단, 길이가 다르면 에러를 던지므로 길이부터 확인합니다
    if (input.length !== expected.length || !timingSafeEqual(input, expected)) {
        redirect("/login?error=1");
    }

    // 로그인 성공: 서명한 토큰을 쿠키로 저장 (lib/auth.ts → lib/session.ts)
    await createSession();

    // 오픈 리다이렉트 방지
    // - next에 아무 주소나 받으면 로그인 후 피싱 사이트로 보내는 데 악용될 수 있습니다
    // - "/"로 시작하는 내부 경로만 허용하고, "//evil.com" 같은 외부 주소는 막습니다
    redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

// 페이지 컴포넌트 (Server Component)
// - Next.js 15부터 searchParams는 Promise라서 await해서 꺼냅니다
//   (설치된 Next.js 16.4 문서에서도 확인)

type Props = {
    searchParams: Promise<{ next?: string; error?: string }>;
};

export default function LoginPage({ searchParams }: Props) {
    return (
        <main className="mx-auto mt-24 flex max-w-xs flex-col gap-3">
            {/* 제목은 요청과 무관하므로 정적 껍데기에 미리 포함됩니다 */}
            <h1 className="text-xl font-bold">Readmap</h1>

            {/* searchParams를 기다리는 부분. 준비되기 전에는 fallback(없음)이 보입니다 */}
            <Suspense fallback={null}>
                <LoginForm searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

// searchParams(Promise)를 await하는 컴포넌트 (Suspense 안에서만 렌더링됨)
async function LoginForm({ searchParams }: Props) {
    const { next = "/", error } = await searchParams;

    return (
        <form action={login} className="flex flex-col gap-3">
            {/* 화면에는 안 보이지만 폼과 함께 제출되는 값: 로그인 후 돌아갈 주소 */}
            <input type="hidden" name="next" value={next} />

            <input
                name="password"
                type="password"
                placeholder="비밀번호"
                className="rounded border px-3 py-2"
                autoFocus
            />

            {/* 비밀번호가 틀리면 /login?error=1 로 돌아와서 이 문구가 보입니다 */}
            {error && <p className="text-sm text-red-600">비밀번호가 틀렸습니다.</p>}

            <button className="rounded bg-black px-3 py-2 text-white">로그인</button>
        </form>
    );
}
