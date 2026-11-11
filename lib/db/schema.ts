import {
    pgTable, uuid, text, jsonb, timestamp, serial, integer, primaryKey, index,
} from "drizzle-orm/pg-core";

// 저장한 글
export const articles = pgTable("articles", {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull().unique(),          // 같은 URL 중복 저장 방지
    site: text("site"),                           // 예: overreacted.io
    title: text("title").notNull(),
    summary: text("summary"),                     // 나중에 읽기 상태면 null
    keyPoints: jsonb("key_points").$type<string[]>().notNull().default([]),
    content: text("content"),                     // 추출한 본문 (재요약용)
    shelf: text("shelf", { enum: ["read", "inbox"] }).notNull().default("read"),
    status: text("status", { enum: ["pending", "done", "failed"] }).notNull().default("done"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    // 제목, 요약 부분 일치 검색용 (pg_trgm)
    index("articles_title_trgm").using("gin", t.title.op("gin_trgm_ops")),
    index("articles_summary_trgm").using("gin", t.summary.op("gin_trgm_ops")),
]);

// 개념 (그래프의 큰 원)
export const concepts = pgTable("concepts", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),        // 예: "React Server Components"
});

// 글 ↔ 개념 연결 (다대다)
export const articleConcepts = pgTable("article_concepts", {
    articleId: uuid("article_id").notNull()
        .references(() => articles.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id").notNull()
        .references(() => concepts.id, { onDelete: "cascade" }),
}, (t) => [
    primaryKey({ columns: [t.articleId, t.conceptId] }), // 같은 연결 중복 방지
]);
