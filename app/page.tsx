// 홈 "/": 읽은 글 목록 (proxy.ts가 로그인한 사람만 통과시킴)
import { Suspense } from "react";
import { connection } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Readmap</h1>

      {/* cacheComponents: DB 조회처럼 요청마다 달라지는 부분은 Suspense 안에서 */}
      <Suspense fallback={<p className="text-gray-500">불러오는 중…</p>}>
        <ArticleList />
      </Suspense>
    </main>
  );
}

async function ArticleList() {
  await connection(); // 빌드 때가 아니라 실제 요청이 왔을 때만 DB 조회

  const rows = await db
    .select({ id: articles.id, title: articles.title, site: articles.site })
    .from(articles)
    .where(eq(articles.shelf, "read")) // "나중에 읽기"는 제외
    .orderBy(desc(articles.createdAt)) // 최근 글이 위로
    .limit(20);

  if (rows.length === 0) {
    return <p className="text-gray-500">아직 저장한 글이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((a) => (
        <li key={a.id} className="rounded border px-3 py-2">
          <p className="font-medium">{a.title}</p>
          {a.site && <p className="text-sm text-gray-500">{a.site}</p>}
        </li>
      ))}
    </ul>
  );
}
