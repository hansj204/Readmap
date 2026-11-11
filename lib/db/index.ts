import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 앱은 pooled 주소(DATABASE_URL)로 연결합니다.
// pooled 연결(PgBouncer)은 트랜잭션마다 실제 연결이 바뀌어서
// 이름 붙인 prepared statement를 쓸 수 없으므로 prepare: false가 필요합니다.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });