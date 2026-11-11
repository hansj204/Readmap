import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit은 Next.js와 별개인 CLI에서 실행되므로 .env.local을 직접 읽어야 합니다
config({ path: ".env.local" });

export default defineConfig({
    dialect: "postgresql",
    schema: "./lib/db/schema.ts",   // 테이블 정의 파일 
    out: "./drizzle",               // 생성된 마이그레이션 SQL이 저장될 폴더
    dbCredentials: {
        url: process.env.DIRECT_URL!, // 마이그레이션은 unpooled 주소로
    },
});
